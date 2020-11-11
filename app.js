var canvas=document.querySelector('canvas');
canvas.width=window.innerWidth;
canvas.height=0.9*window.innerHeight;
window.addEventListener("resize",function(){
    canvas.width=window.innerWidth;
    canvas.height=0.9*window.innerHeight;
    init();
})
var colorPallete=[
    "#2B4040","#5A7370","#F0F2F2","#F2D5C4","#D2D9D8",
    "#202D46","#EE706B","#FEA00D","#0D0D0D","#262626",
    "#595959","#A6A6A6","#F2F2F2","#0A1747","#0029FA",
    "#8D07F6","#FFFF05","#D4DBF5","#15FA00","#F05800"
];
var c=canvas.getContext('2d');
var border=0;
var cellSide=20;
var xCellNo=parseInt(canvas.width/(cellSide+border));
var yCellNo=parseInt(canvas.height/(cellSide+border));
var tmp=xCellNo*(cellSide+border);
var margin=(canvas.width-tmp)/2;
var topMargin=0.1*window.innerHeight;
var queue=[];
var stack=[];
var found=false;
var dist=undefined;
var play=false;
var randomWalls=false;
var mazeMode=false;
var curSelection=0;
var lastSelection=0;
var start={
    f:parseInt(Math.random()*yCellNo),
    s:parseInt(Math.random()*xCellNo)
};
var end={
    f:parseInt(Math.random()*yCellNo),
    s:parseInt(Math.random()*xCellNo)
};
function Cell(i,j,w,h){
    this.i=i;
    this.j=j;
    this.x=j*(w+border)+margin;
    this.y=i*(h+border)+margin;
    this.h=h;
    this.w=w;
    this.color=colorPallete[12];
    this.distance=-1;
    this.wall=false;
    this.walls=[true,true,true,true];
    this.visited=false;
    this.parent=undefined;
    this.start=false;
    this.end=false;
    this.current=false;
    this.queue=false;
    this.path=false;
    this.draw=function(){
        c.beginPath();
        c.rect(this.x,this.y,this.w,this.h);
        c.fillStyle=this.color;
        c.fill();
        c.strokeStyle="red";
        c.lineWidth=0.75;
        if(this.walls[0]){
            c.beginPath();
            c.moveTo(this.x,this.y);
            c.lineTo(this.x+cellSide,this.y);
            c.stroke();
        }
        if(this.walls[1]){
            c.beginPath();
            c.moveTo(this.x+cellSide,this.y);
            c.lineTo(this.x+cellSide,this.y+cellSide);
            c.stroke();
        }
        if(this.walls[2]){
            c.beginPath();
            c.moveTo(this.x,this.y+cellSide);
            c.lineTo(this.x+cellSide,this.y+cellSide);
            c.stroke();
        }
        if(this.walls[3]){
            c.beginPath();
            c.moveTo(this.x,this.y);
            c.lineTo(this.x,this.y+cellSide);
            c.stroke();
        }
    }
    this.update=function(){
        if(this.start){
            this.color=colorPallete[19];
        }else if(this.end){
            this.color=colorPallete[18];
        }else if(this.wall){
            this.color=colorPallete[5];
        }else if(this.queue){
            this.color=colorPallete[7];
        }else if(this.path || this.current){
            this.color=colorPallete[16];
        }else if(this.visited && !this.start && !this.end){
            this.color=colorPallete[1];
        }else this.color=colorPallete[12];
        this.draw();
    }
}
var Cells=new Array(yCellNo);
function init(){
    Clear();
    RandomWalls();
    RandomStartEnd();
}
var dx=[-1,0,1,0];
var dy=[0,1,0,-1];
function validCell(i,j){
    return (i>=0 && i<yCellNo && j>=0 && j<xCellNo);
}
function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0,innerWidth,innerHeight);
    //updating queue
    if(play){
        curSelection=document.getElementById('algoOptions').selectedIndex;
        if(curSelection!=lastSelection && curSelection==2){
            Clear();
        }
        if(curSelection==1){
            BFS();
        }else if(curSelection==2){
            mazeMode=true;
            MazeGen();
        }
        lastSelection=curSelection;
    }
    //updating cells
    for(var i=0;i<Cells.length;i++){
        for(var j=0;j<Cells[i].length;j++){
            Cells[i][j].update();
        }
    }
}
init();
animate();
function addQueue(child,parent){
    if(!child.visited && !child.wall){
        queue.push(child);
        child.distance=parent.distance+1;
        child.parent=parent;
    }
    child.visited=true;
}
function Play(){
    var btn=document.getElementById('play-btn');
    if(play){
        play=false;
        btn.innerText="Play";
    }else{
        play=true;
        btn.innerText="Pause";
    }
}
function Clear(){
    queue=[];
    xCellNo=parseInt(canvas.width/(cellSide+border));
    yCellNo=parseInt(canvas.height/(cellSide+border));
    for(var i=0;i<Cells.length;i++){
        Cells[i]=new Array(xCellNo);
        for(var j=0;j<Cells[i].length;j++){
            Cells[i][j]=new Cell(i,j,cellSide,cellSide);
        }
    }
    found=false;
}
function Reset(){
    play=true;
    Play();
    Unvisit();
    setStart(start.f,start.s);
    setEnd(end.f,end.s);
    found=false;
}
function RandomWalls(){
    for(var i=0;i<yCellNo;i++){
        for(var j=0;j<xCellNo;j++){
            if(Math.random()<0.2)Cells[i][j].wall=true;
        }
    }
}
function RandomStartEnd(){
    delStart();
    delEnd();
    start={
        f:parseInt(Math.random()*yCellNo),
        s:parseInt(Math.random()*xCellNo)
    };
    end={
        f:parseInt(Math.random()*yCellNo),
        s:parseInt(Math.random()*xCellNo)
    };
    Reset();
    setStart(start.f,start.s);
}
function setStart(i,j){
    delStart();
    start.f=i,start.s=j;
    Cells[start.f][start.s].start=true;
    Cells[start.f][start.s].wall=false;
    Cells[start.f][start.s].distance=0;
    Cells[start.f][start.s].visited=true;
    queue.push(Cells[start.f][start.s]);
}
function delStart(){
    queue=[];
    Cells[start.f][start.s].start=false;
    Cells[start.f][start.s].distance=-1;
    Cells[start.f][start.s].visited=false;
}
function setEnd(i,j){
    delEnd();
    end.f=i,end.s=j;
    Cells[end.f][end.s].end=true;
    dist=Cells[end.f][end.s];
}
function delEnd(){
    Cells[end.f][end.s].end=false;
    Cells[end.f][end.s].wall=false;
    dist=undefined;
}
function Unvisit(){
    for(var i=0;i<yCellNo;i++){
        for(var j=0;j<xCellNo;j++){
            Cells[i][j].visited=false;
            Cells[i][j].queue=false;
            Cells[i][j].path=false;
            Cells[i][j].parent=undefined;
        }
    }
}
var adding=false,deleting=false;
canvas.addEventListener('contextmenu',function(mouse){
    mouse.preventDefault();
})
canvas.addEventListener('mousemove',function(mouse){
    ResolveMouseClick(mouse);
})
canvas.addEventListener('mousedown',function(mouse){
    if(mouse.button==0)adding=true;
    else if(mouse.button==2)deleting=true;
    ResolveMouseClick(mouse);
})
canvas.addEventListener('mouseup',function(){
    adding=false;
    deleting=false;
})
function ResolveMouseClick(mouse){
    var xCor=parseInt(mouse.x/(cellSide+border));
    var yCor=parseInt((mouse.y-topMargin)/(cellSide+border));
    var tools=document.querySelectorAll('input[name="tool"]');
    if(validCell(yCor,xCor)){
        tools.forEach(tool=>{
            if(tool.checked){
                if(tool.value=="wall"){
                    if(!Cells[yCor][xCor].start && !Cells[yCor][xCor].end && !Cells[yCor][xCor].visited && adding){
                        Cells[yCor][xCor].wall=true;
                    }else if(!Cells[yCor][xCor].start && !Cells[yCor][xCor].end && !Cells[yCor][xCor].visited && deleting){
                        Cells[yCor][xCor].wall=false;
                    }
                }else if(tool.value=="start"){
                    if(adding){
                        Reset();
                        setStart(yCor,xCor);
                    }else if(deleting && yCor==start.f && xCor==start.s){
                        Reset();
                        delStart();
                    }
                }else if(tool.value=="end"){
                    if(adding){
                        Reset();
                        setEnd(yCor,xCor);
                    }else if(deleting && yCor==end.f && xCor==end.s){
                        Reset();
                        delEnd();
                    }
                }
            }
        })
    }else{
        adding=false;
        deleting=false;
    }
}
function BFS(){
    if(queue.length>0 && !found){
        for(var i=0;i<queue.length;i++)queue[i].queue=true;
        var cur=queue.shift();
        cur.queue=false;
        if(!cur.end){
            for(var i=0;i<dx.length;i++){
                if(validCell(cur.i+dx[i],cur.j+dy[i])){
                    //0-t 1-r 2-b 3-l
                    if(mazeMode){
                        if(!cur.walls[i]){
                            addQueue(Cells[cur.i+dx[i]][cur.j+dy[i]],cur);
                        }
                    }else addQueue(Cells[cur.i+dx[i]][cur.j+dy[i]],cur);
                }
            }
        }else found=true;
    }
    if(found){
        if(dist.parent!=undefined){
            dist.parent.path=true;
            dist=dist.parent;
        }
    }
}
var curCell=Cells[start.f][start.s];
Cells[curCell.i][curCell.j].current=true;
function MazeGen(){
    Cells[curCell.i][curCell.j].visited=true;
    Cells[curCell.i][curCell.j].current=false;
    var k=parseInt(Math.random()*111);
    var foundNeighbor=false;
    var Neighbor=undefined;
    for(var i=0;i<dx.length;i++){
        var index=(i+k)%dx.length;
        if(validCell(curCell.i+dx[index],curCell.j+dy[index])){
            Neighbor=Cells[curCell.i+dx[index]][curCell.j+dy[index]];
            if(!Cells[Neighbor.i][Neighbor.j].visited){
                //0-t 1-r 2-b 3-l
                if(index==0){
                    Cells[curCell.i][curCell.j].walls[0]=false;
                    Cells[Neighbor.i][Neighbor.j].walls[2]=false;
                }else if(index==1){
                    Cells[curCell.i][curCell.j].walls[1]=false;
                    Cells[Neighbor.i][Neighbor.j].walls[3]=false;
                }else if(index==2){
                    Cells[curCell.i][curCell.j].walls[2]=false;
                    Cells[Neighbor.i][Neighbor.j].walls[0]=false;
                }else if(index==3){
                    Cells[curCell.i][curCell.j].walls[3]=false;
                    Cells[Neighbor.i][Neighbor.j].walls[1]=false;
                }
                stack.push(Cells[curCell.i][curCell.j]);
                curCell=Cells[Neighbor.i][Neighbor.j];
                Cells[curCell.i][curCell.j].current=true;
                foundNeighbor=true;
                break;
            }
        }
    }
    if(!foundNeighbor){
        if(stack.length>0){
            curCell=stack.pop();
            Cells[curCell.i][curCell.j].current=true;
        }
    }
}

