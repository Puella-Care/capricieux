localStorage.getItem('motoya') || fetch('/magica/fonts/MTF4a5kp.ttf')
  .then(_ => _.arrayBuffer())
  .then(_ => localStorage.setItem('motoya', new Uint8Array(_).toBase64()))
  .catch(console.error);

const [
  { PopupClass },
] = await new Promise($ => requirejs.config({
  context: 'todestrieb',
  name: 'todestrieb',
  baseUrl: '/magica/',
  waitSeconds: 50,
  paths: {
    jquery: 'js/libs/jquery-3.7.1.min',
    underscore: 'js/libs/underscore-min',
    backbone: 'js/libs/backbone-min',
    backboneCommon: 'js/_common/backboneCommon',
  },
})([
  'backboneCommon',
], (..._) => $(_)));

const udKeys = [
  'charaList',
  'doppelList',
  'enemyList',
  'gameUser',
  'pieceList',
  'user',
  'userCardList',
  'userCharaEnhancementCellList',
  'userCharaList',
  'userDeckList',
  'userDoppelList',
  'userEnemyList',
  'userItemList',
  'userLive2dList',
  'userPieceArchiveList',
  'userPieceCollectionList',
  'userPieceList',
  'userPieceSetList',
  'userStatusList',
];

const connect = $ => {
  if (!udKeys.every(_ => $[_]))
    throw new Error('ud.json validation failed', { cause: $ });
  return {
    currentPlatform: 'ANDROID',
    eventList: [],
    regularEventList: [],
    campaignList: [],
    functionMaintenanceList: [],
    forceClearCache: false,
    resourceUpdated: false,
    isServerActive: true,
    ...$,
    currentTime: new Date().toLocaleString('en-ZA', { timeZone: 'Asia/Tokyo' }).replace(',', ''),
  };
};

$(document)
  .on('click', '#ConnectBtn', async e => {
    e.preventDefault();
    const localUserData = await new Promise(resolve =>
      $('<input>', { type: 'file', accept: '.json,.zip' })
        .one('change', ({ target: { files: [_] } }) => resolve(_))
        .trigger('click')
    ).then(async _ => {
      switch (_?.type) {
        case 'application/json':
          return connect(JSON.parse(await _.text()));
        case 'application/x-zip-compressed':
          const { default: { loadAsync } } = await import('https://cdn.skypack.dev/jszip');
          const { files } = await loadAsync(_);
          if (!files)
            throw new Error('Connect extraction failed', { cause: _ });
          const ud = files['connect/ud.json'];
          if (ud)
            return connect(ud);
          if (!udKeys.every(_ => `connect/${_}.json` in files))
            throw new Error('Connect validation failed', { cause: files });
          return connect(Object.fromEntries(await Promise.all(udKeys.map(async _ => [
            _,
            JSON.parse(await files[`connect/${_}.json`].async('text')),
          ]))));
        default:
          throw new Error('Unknown file type', { cause: _ });
      }
    }).catch(_ => (new PopupClass({
      title: _.name,
      content: _.message,
      closeBtnText: 'Whatevs',
    }), console.error(_)));

    // QuotaExceededError
    // return localUserData && !localStorage.setItem('todestrieb', JSON.stringify(localUserData));

    return localUserData && await new Promise((oncomplete, onerror) => Object.assign(indexedDB.open('todestrieb', 1), {
      onupgradeneeded: ({ target: { result } }) => result.createObjectStore('todestrieb'),
      onerror,
      onsuccess: ({ target: { result } }) => Object.assign(result.transaction('todestrieb', 'readwrite'), {
        oncomplete,
        onerror,
      }).objectStore('todestrieb').put(localUserData, 'localUserData'),
    })).then(() => {
      const { user: { personalId, loginName, createdAt, lastAccessDate }, gameUser: { inviteCode } } = localUserData;
      return new PopupClass({
        title: 'Connect',
        content: `Successfully connected ${personalId}/${inviteCode}<br/><br/>${createdAt} &mdash; ${lastAccessDate}`,
        closeBtnText: loginName,
      }, null, () => {}, () => location.href = '/magica/index.html');
    });
  })
  .on('contextmenu', '#ConnectBtn', async e => {
    e.preventDefault();
    return await new Promise((oncomplete, onerror) => Object.assign(indexedDB.open('todestrieb', 1), {
      onupgradeneeded: ({ target: { result } }) => result.createObjectStore('todestrieb'),
      onerror,
      onsuccess: ({ target: { result } }) => Object.assign(result.transaction('todestrieb', 'readwrite'), {
        oncomplete,
        onerror,
      }).objectStore('todestrieb').delete('localUserData'),
    })).then(() => new PopupClass({
      title: 'Connect',
      content: 'Successfully disconnected',
    }, null, () => {}, () => location.href = '/magica/index.html'));
  });
