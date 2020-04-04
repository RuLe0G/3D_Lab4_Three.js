var container;
var camera, scene, renderer;
var keyboard = new THREEx.KeyboardState();
var N = 100;
var geometry;
var cursor;
var circle;
var radius = 10;
var clock = new THREE.Clock();
var Bdirectional = 0;

var mouse = { x: 0, y: 0 }; //переменная для хранения координат мыши
//массив для объектов, проверяемых на пересечение с курсором
var targetList = []; 

init();
animate();

function init()
{
    geometry = new THREE.Geometry();
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 4000 );

    camera.position.set(N*1.5, N, N/2);

    camera.lookAt(new THREE.Vector3(  N/2, 0.0, N/2));

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x3f3f3f, 1);
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

 
    renderer.domElement.addEventListener('mousedown',onDocumentMouseDown,false);
    renderer.domElement.addEventListener('mouseup',onDocumentMouseUp,false);
    renderer.domElement.addEventListener('mousemove',onDocumentMouseMove,false);
    renderer.domElement.addEventListener('wheel',onDocumentMouseScroll,false);
    renderer.domElement.addEventListener("contextmenu",function (event)
                                        {
                                            event.preventDefault();
                                        }); 
    // создание направленного источника освещения
    var light = new THREE.DirectionalLight(0xffffff);
    // позиция источника освещения
    light.position.set( N/2, N/2, N/2 );
    // направление освещения
    light.target = new THREE.Object3D();
    light.target.position.set(N/2, 0, N/2 );
    scene.add(light.target);
    // включение расчёта теней
    light.castShadow = true;
    // параметры области расчёта теней
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 60, 1, 1200, 2500 ) );
    light.shadow.bias = 0.0001;
    // размер карты теней
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add( light );
    var helper = new THREE.CameraHelper(light.shadow.camera);
    //scene.add( helper );

    Cursor();
    Circle();
    CreateTerrain();


}



function onWindowResize()
{
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
}



// В этой функции можно изменять параметры объектов и обрабатывать действия пользователя
function animate()
{
    var delta = clock.getDelta();
    if (Bdirectional != 0) 
    {
        Spbruh(Bdirectional, delta);
    }
    requestAnimationFrame( animate );
    render();

}


function render()
{
     
    // Рисованиекадра
    renderer.render( scene, camera );
}

function CreateTerrain()
{
    for (var i = 0; i < N; i++)
    for (var j = 0; j < N; j++) {


        geometry.vertices.push(new THREE.Vector3(i, 0.0, j));
    }


    for (var i = 0; i < (N-1); i++)
    for (var j = 0; j < (N-1); j++) 
    {
        var i1 = i + j*N;
        var i2 = (i+1) + j*N;
        var i3 = (i+1) + (j+1)*N;
        var i4 = i + (j+1)*N;

        geometry.faces.push(new THREE.Face3(i1, i2, i3));
        geometry.faces.push(new THREE.Face3(i1, i3, i4));


        geometry.faceVertexUvs[0].push([new THREE.Vector2(i/(N-1), j/(N-1)),
            new THREE.Vector2((i+1)/(N-1), (j)/(N-1)),
            new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))]); 

        geometry.faceVertexUvs[0].push([new THREE.Vector2((i)/(N-1), j/(N-1)),            
            new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),
            new THREE.Vector2((i)/(N-1), (j+1)/(N-1))
        ]);
    }

    geometry.computeFaceNormals(); 
    geometry.computeVertexNormals(); 

    var loader = new THREE.TextureLoader(); 
    //var tex = loader.load( 'pics/ori.jpg' );
    var tex = loader.load( 'pics/grasstile.jpg' );  
    
    // Режим повторения текстуры 
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;  
    // Повторить текстуру 10х10 раз 
    tex.repeat.set( 3, 3 ); 


    var mat = new THREE.MeshLambertMaterial({
        map:tex,
        wireframe: false,     
        side:THREE.DoubleSide 
    });  


    var mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(0.0, 0.0, 0.0);

    mesh.receiveShadow = true;
    mesh.castShadow = true;

    targetList.push(mesh);
    scene.add(mesh);

}
function loadModel(path, oname, mname)
{
 // функция, выполняемая в процессе загрузки модели (выводит процент загрузки)
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var onError = function ( xhr ) { };
    // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( path );
    // функция загрузки материала
    mtlLoader.load( mname, function( materials )
    {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( path );
        // функция загрузки модели
        objLoader.load( oname, function ( object )
        {

            object.traverse( function ( child )
            {
             if ( child instanceof THREE.Mesh )
             {
             child.castShadow = true;
             }
            } );
            
            for (var i = 0; i<60; i++)
            {
                var x = Math.random() * N;
                var z = Math.random() * N;

                var y = geometry.vertices[ Math.round(z) + Math.round(x) * N].y;

                object.position.x = x;
                object.position.y = y;
                object.position.z = z;

                var s = (Math.random()*100) +30;
                s /= 400.0;
                object.scale.set(s,s,s);
                scene.add(object.clone());
                
            }            
        }, onProgress, onError );
    });
}

function Cursor(){
    //параметры цилиндра: диаметр вершины, диаметр основания, высота, число сегментов
    var geometry = new THREE.CylinderGeometry( 1.5, 0, 5, 64 );
    var cyMaterial = new THREE.MeshLambertMaterial( {color: 0x888888} );
    cursor = new THREE.Mesh( geometry, cyMaterial );
    scene.add( cursor );
}
function Circle(){
    var material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
    var segments = 128;
    var circleGeometry = new THREE.CircleGeometry( 1, segments );
    //удаление центральной вершины
    circleGeometry.vertices.shift();

    for (var i = 0; i < circleGeometry.vertices.length; i++) {
        circleGeometry.vertices[i].z = circleGeometry.vertices[i].y;
        circleGeometry.vertices[i].y = 0;
    }
    
    circle = new THREE.Line( circleGeometry, material );
    circle.scale.set(radius,1,radius);    
    scene.add( circle ); 
}



function onDocumentMouseScroll( event ){
    if(radius>1 )
        if(event.wheelDelta < 0)
            radius--;
    if(radius<50 )
        if(event.wheelDelta > 0)
            radius++;
    circle.scale.set(radius,1,radius); 
}
function onDocumentMouseMove( event ) {
    //if (Bdirectional == 0)
    {
    //определение позиции мыши
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    //создание луча, исходящего из позиции камеры и проходящего сквозь позицию курсора мыши
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    vector.unproject(camera);
    var ray = new THREE.Raycaster( camera.position,
    vector.sub( camera.position ).normalize() );
    // создание массива для хранения объектов, с которыми пересечётся луч
    var intersects = ray.intersectObjects( targetList );

    // если луч пересёк какой-либо объект из списка targetList
    if ( intersects.length > 0 )
    {   
        if(cursor!=null)
        cursor.position.copy(intersects[0].point);        
        cursor.position.y += 2.5;
        //печать списка полей объекта
        //console.log(intersects[0]);
        if(circle!=null)
        circle.position.copy(intersects[0].point);
        circle.position.y = 0;

        for (var i = 0; i < circle.geometry.vertices.length; i++) 
        {
            //получение позиции в локальной системе координат
            var pos = new THREE.Vector3();
            pos.copy(circle.geometry.vertices[i]);
            //нахождение позиции в глобальной системе координат 
            pos.applyMatrix4(circle.matrixWorld);
            
            var x = Math.round(pos.x);
            var z = Math.round(pos.z);
            if (x >= 0 && x< N && z>=0 && z < N)
            {
            var y = geometry.vertices[z + x * N].y ;
            circle.geometry.vertices[i].y = y + 0.5;
            } 
            else
            circle.geometry.vertices[i].y = 0;
    
        } 
        
        circle.geometry.verticesNeedUpdate = true; //обновление вершин
    }
}
}
var mousevisble = true;
function onDocumentMouseDown( event ) {
    if (event.which == 1) {
        Bdirectional = 1;   
    }
    if (event.which == 2) {
        if (mousevisble == true)
        {
        render.    
        mousevisble = false;
        }else
        {            
        
        mousevisble = true;
        }
        
    }        
    if (event.which == 3) {
        Bdirectional = -1;   
        //FLbruh();
        //Rabruh(1);
    }

}

function onDocumentMouseUp( event ) {
    Bdirectional = 0;
}

function Spbruh( Bdirectional, delta )
{
    for (var i = 0; i < geometry.vertices.length; i++)
    {
        var x2 = geometry.vertices[i].x;
        var z2 = geometry.vertices[i].z;
        var r = radius;
        var x1 = cursor.position.x;
        var z1 = cursor.position.z;        

        var h = r*r - (((x2 - x1) * (x2 - x1)) + ((z2-z1) * (z2-z1)))
        if(h > 0)
        {
            geometry.vertices[i].y += Math.sqrt(h) * Bdirectional * delta;
        }
        
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals(); //пересчёт нормалей
    geometry.verticesNeedUpdate = true; //обновление вершин
    geometry.normalsNeedUpdate = true; //обновление нормалей

   

}

function FLbruh( delta )
{
    for (var i = 0; i < geometry.vertices.length; i++)
    {
        var x2 = geometry.vertices[i].x;
        var z2 = geometry.vertices[i].z;
        var r = radius;
        var x1 = cursor.position.x;
        var z1 = cursor.position.z;        

        var h = r*r - (((x2 - x1) * (x2 - x1)) + ((z2-z1) * (z2-z1)))
        if(h > 0)
        {
            if (geometry.vertices[i].y > 0)
            geometry.vertices[i].y -= Math.sqrt(h) * delta;
            if (geometry.vertices[i].y < 0)
            geometry.vertices[i].y += Math.sqrt(h) * delta;            
        }
        
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals(); //пересчёт нормалей
    geometry.verticesNeedUpdate = true; //обновление вершин
    geometry.normalsNeedUpdate = true; //обновление нормалей
}

function Rabruh( delta  )
{
    for (var i = 0; i < geometry.vertices.length; i++)
    {
        var x2 = geometry.vertices[i].x;
        var z2 = geometry.vertices[i].z;
        var r = radius;
        var x1 = cursor.position.x;
        var z1 = cursor.position.z;        

        var h = r*r - (((x2 - x1) * (x2 - x1)) + ((z2-z1) * (z2-z1)))
        if(h > 0)
        {
            geometry.vertices[i].y += Math.sin(h) *  delta;
        }
        
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals(); //пересчёт нормалей
    geometry.verticesNeedUpdate = true; //обновление вершин
    geometry.normalsNeedUpdate = true; //обновление нормалей
}