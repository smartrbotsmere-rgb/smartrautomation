(function(){
    var t=document.getElementById('time'),d=document.getElementById('date');
    function tick(){
      var n=new Date();
      var h=n.getHours(),m=n.getMinutes();
      t.textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;
      d.textContent=n.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
    }
    tick();setInterval(tick,10000);
  })();