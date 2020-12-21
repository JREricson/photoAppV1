 //setting viewport variables (https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions)
 const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
 );
 const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
 );

 $('#photoGallery').justifiedGallery({
    rowHeight: Math.floor(vh / 3.3),
    lastRow: 'nojustify',
    margins: 20,
    lastRow: 'center',
 });