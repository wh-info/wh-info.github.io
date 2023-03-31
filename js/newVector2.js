alwaysDraw={
    element:undefined,
    that:undefined,
    flag:false
   }
   TraceArray=[]
   currentTraces={}
   var tt=true;;
$(document).ready(function() {
 


  function canvas() {
	$("#canvas").attr({ 
		"height": $("#pi").outerHeight(),
		"width": $("#pi").outerWidth() 
	});
}
	
    Object.values(wormholes).forEach(wormhole => {

        wormhole.dom = document.createElement('li');
        wormholeel=$(wormhole.dom)

        if(wormhole.showincol==0) wormholeel.appendTo('.items ul.type0')
        if(wormhole.showincol==1) wormholeel.appendTo('.items ul.type1')
        if(wormhole.showincol==2) wormholeel.appendTo('.items ul.type2')

        wormholeel.text(wormhole.name).wrapInner($('<span />')).
        mouseenter(function (){ viewTrace(wormhole, $(this)) }).
        mouseleave(function (){ removeTrace(wormhole, $(this)) }).
        click(function (){ drawTrace(wormhole,$(this)) })
        if( wormhole.tooltip!="")
        wormholeel.children("span").attr("class", "tooltip").attr("data-jbox-content", wormhole.tooltip.data_jbox_content);
       ;

       
      });
      $(".reset").click(function(){
        savedTraces=[];
        alwaysDraw.flag=false;
        canvas();
       
        $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:"#1d4145"});;})
        
      })
     makeColumn=(array, key)=>{
        Object.values(array).forEach(el => {
            el.dom = document.createElement('li');
            this_el=$(el.dom)
            this_el.appendTo('.items ul.'+key);
            this_el.text(el.title).wrapInner($('<span />')).find("span").
            mouseenter(function (){ viewFilterTrace(el, $(this), key) }).
            mouseleave(function (){ removeFilterTrace(el, $(this)) }).
            click(function (){ FilterTrace(el,$(this),key)})
            if( el.tooltip!="")
             this_el.children("span").attr("class", "tooltip").attr("data-jbox-content", el.tooltip.data_jbox_content);
            ;
          })
     }
     makeColumn(respawn, "respawn")
     makeColumn(spawnIn, "spawnIn")
     makeColumn(leadsTo, "leadsTo")
     makeColumn(indMass, "indMass")
     makeColumn(indGas, "indGas")
    
     var tool=new jBox('Mouse', {
        attach: '.tooltip',
        theme: 'TooltipDark',
        getContent: 'data-jbox-content',
    });
    if(tt){
        tool.attach($(".tooltip"));
        $(".toggletooltip").css({backgroundColor:"#315970"})
    }
     else {
       tool.detach($(".tooltip"));
       $(".toggletooltip").css({backgroundColor:"#1e3644", boxSadow: "0px 0px 15px 30px rgb(0, 0, 0)"})
     }
    $(".toggletooltip").click(function(){

        tt=!tt;
     if(tt){
         tool.attach($(".tooltip"));
         $(this).css({backgroundColor:"#315970"})
     }
      else {
        tool.detach($(".tooltip"));
        $(this).css({backgroundColor:"#1e3644"})
      }
      })
    
      canvas();
	$(window).resize(function() { // todo: get event, only repaint on mouse release
		canvas();
	});
/*
 respawn:["static"],
        spawnIn:["class-2",],
        leadsTo:["ls"], 
        indMass:["up-to-battleship"], 
        toMass:["2-000-000-000-kg"], 
        lifeTime:["24h"],
        */
       
        
    function line(a,b) {
       
        $(a.dom).css({color:a.hover})
        $(b.dom).css({color:b.hover})
                 pad = 0;
            apos=$(a.dom).children("span").position();
            bpos= $(b.dom).children("span").position();
            fx  = apos.left + 4;
            fy  = apos.top +  $(a.dom).children("span").height()/2 + 1;
            tx  = bpos.left + $(b.dom).children("span").width() - 2;
            ty  =  bpos.top + $(b.dom).children("span").height()/2 + 1;
            var cvs = document.getElementById('canvas');
        
            var ctx = cvs.getContext('2d');
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tx,ty);
            ctx.lineTo(fx,fy);
            ctx.globalAlpha = 0.5;
        
            var gdt = ctx.createLinearGradient( tx,ty, fx,fy );
            gdt.addColorStop(0, b.hover);
            gdt.addColorStop(1, a.hover);
        
            ctx.strokeStyle = gdt;
            ctx.stroke();
        }
    drawTrace=(element,that)=>{
        savedTraces=[];
        if(  alwaysDraw.flag==true  ){
            alwaysDraw.flag=false;
            $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:element.color});;})
            return removeTrace(alwaysDraw.element,alwaysDraw.that)
        }
       alwaysDraw={
        element:element,
        that:that,
        flag:true
       }
      
       $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:" #06171c"});;})
        removeFilterTrace(element, that)
       viewTrace(alwaysDraw.element, alwaysDraw.that)
       
     }
     function get(element,keys, array){
        keys.forEach(el=>{
            console.log(el)
            Object.values(array).filter(e=>{return e.key==el}).forEach(array=>{ line(array, element)})
        })
       // return Object.values(array).filter(e=>{return e.key==key})
     }
    viewTrace=(element, that)=>{
        canvas();
        if(  alwaysDraw.flag==true  ) { 
            element=alwaysDraw.element;
            that=alwaysDraw.that
        }
        that.addClass('current');
        get(element,element.respawn,respawn)
        get(element,element.spawnIn,spawnIn)
        get(element,element.leadsTo,leadsTo)
        get(element,element.indMass,indMass)
        get(element,element.indGas,indGas)
        //get(element,element.respawn,respawn).forEach(respawn=>{ line(respawn, element)})
        //get(element.spawnIn,spawnIn).forEach(spawnIn=>{ line(spawnIn, element)})
      //  get(element.leadsTo,leadsTo).forEach(leadsTo=>{ line(leadsTo, element)})
       // get(element.indMass,indMass).forEach(indMass=>{ line(indMass, element)})
       // get(element.toMass,toMass).forEach(toMass=>{ line(toMass, element)}) 
      //  get(element.lifeTime,lifeTime).forEach(lifeTime=>{ line(lifeTime, element)}) 
        if(savedTraces.length>0){
            
            currentTraces=Object.values(wormholes);
            savedTraces.forEach(el=>currentTraces=currentTraces.filter(e=>{return e[el.key].indexOf(el.element.key)!=-1}))
            savedTraces.forEach(el=>drawFilteresTraces(currentTraces, el.element))
        }
    }
    removeTrace=(element, that)=>{
        if(  alwaysDraw.flag==true  ) return
        canvas();
        that.removeClass('current');
      //  $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:element.color});;})
        removeFilterTrace(element, that)
    }
    savedTraces=[];
    FilterTrace=(element, that, key)=>{
        alwaysDraw.flag=false;
       
        id=savedTraces.map(e=>e.key).indexOf(key)
       if(id>-1) savedTraces.splice(id,1);
       else if(currentTraces.length>0){
            savedTraces.push(
             {
                 key:key,
                 element:element,
                 that:that
             }
            )
         }
         if(savedTraces.length>0)viewFilterTrace(element, that, key)
    }
    drawFilteresTraces=(currentTraces, element)=>{
        if(  alwaysDraw.flag==true  ) return
        currentTraces.forEach(e=>{
             line(element,e)
        })
    }
    viewFilterTrace=(element, that, key)=>{
        if(  alwaysDraw.flag==true  ) return
        if(savedTraces.length>0) $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:" #06171c"});;})
        
       canvas();
        if(savedTraces.length>0){
            currentTraces=Object.values(wormholes);
            savedTraces.forEach(el=>{
                currentTraces=currentTraces.filter(e=>{return e[el.key].indexOf(el.element.key)!=-1})
               
            })
            currentViewTraces=Object.values(currentTraces).filter(e=>{return e[key].indexOf(element.key)!=-1})
            if(currentViewTraces.length>0) 
                 {
                currentTraces=currentViewTraces;
                drawFilteresTraces(currentTraces, element)
             }
                 savedTraces.forEach(el=>{
                drawFilteresTraces(currentTraces, el.element)
                    })
            
        }
        else
        {
            currentTraces=Object.values(wormholes).filter(e=>{return e[key].indexOf(element.key)!=-1})
            drawFilteresTraces(currentTraces, element)
            
        }
       
    }
   
	removeFilterTrace=(element, that)=>{
        if(  alwaysDraw.flag==true  ) return
        canvas();
        that.removeClass("color_selected");
        $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:element.color});;})
        if(savedTraces.length>0){
            if(savedTraces.length>0) $('.items ').find("li").each(function(){$(this).removeClass('current').css({color:" #06171c"});;})
            currentTraces=Object.values(wormholes);
            savedTraces.forEach(el=>currentTraces=currentTraces.filter(e=>{return e[el.key].indexOf(el.element.key)!=-1}))
            savedTraces.forEach(el=>drawFilteresTraces(currentTraces, el.element))
        }
    } 
});