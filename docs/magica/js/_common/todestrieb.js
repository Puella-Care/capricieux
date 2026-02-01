localStorage.getItem("motoya") || fetch("/magica/fonts/MTF4a5kp.ttf").then($ => $.arrayBuffer()).then($ => localStorage.setItem("motoya", new Uint8Array($).toBase64()));
