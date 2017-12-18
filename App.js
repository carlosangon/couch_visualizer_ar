import Expo, { Asset } from 'expo';
import React from 'react';
import { StyleSheet, Text, View, Button, TouchableHighlight } from 'react-native';

const THREE = require('three');
global.THREE = THREE;
require('./js/OBJLoader')
require('./js/MTLLoader')
import ExpoTHREE from 'expo-three';
console.disableYellowBox = true;

// import fabric and wood materials
const dana_fabric = require('./model/dana.png')
const stroheim_fabric = require('./model/stroheim.png')
const walnut_wood = require('./model/dark.png')


const fabric_material = stroheim_fabric;
const base_material = walnut_wood;

// import couch materials
const couch_bottomOBJ = require('./model/couch-bottom.obj')
const couch_side_leftOBJ = require('./model/couch-side-left.obj')
const couch_side_rightOBJ = require('./model/couch-side-right.obj')
const couch_backOBJ = require('./model/couch-back.obj')
const couch_seat_leftOBJ = require('./model/couch-seat-left.obj')
const couch_seat_rightOBJ = require('./model/couch-seat-right.obj')
const couch_pillow_leftOBJ = require('./model/couch-pillow-left.obj')
const couch_pillow_rightOBJ = require('./model/couch-pillow-right.obj')
const couch_baseOBJ = require('./model/base.obj') 

const scaleLongestSideToSize = (mesh, size) => {
  const { x: width, y: height, z: depth } =
    new THREE.Box3().setFromObject(mesh).getSize();
  const longest = Math.max(width, Math.max(height, depth));
  const scale = size / longest;
  mesh.scale.set(scale, scale, scale);
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
  
  this.state = {
    loaded: false,
  }
  // this.couchLoader = this.couchLoader.bind(this);
}

  componentWillMount() {
    this.preloadAssetsAsync();
  }
  _onPressButton(){
      fabric_material = dana_fabric;
      couchLoader()
  }
  render() {
    return this.state.loaded ? (
      <View style={{ flex: 1 }}>
  
        <Expo.GLView
          ref={(ref) => this._glView = ref}
          style={{ flex: 1 }}
          onContextCreate={this._onGLContextCreate}
        >
        
        </Expo.GLView>
        {/* <Text style={{ fontSize: 30, color: '#ff0000' }}> Button will go here </Text> */}
        <TouchableHighlight onPress={this._onPressButton}><Text>Press this</Text></TouchableHighlight>
      </View>
    ) : <Expo.AppLoading />;
  }

  async preloadAssetsAsync() {
    await Promise.all([
      couch_bottomOBJ,
      couch_side_leftOBJ,
      couch_side_rightOBJ,
      couch_backOBJ,
      couch_seat_leftOBJ,
      couch_seat_rightOBJ,
      couch_pillow_leftOBJ,
      couch_pillow_rightOBJ,
      couch_baseOBJ,
      
      // preload fabric materials
      stroheim_fabric,
      dana_fabric,
      walnut_wood,
    ].map((module) => Expo.Asset.fromModule(module).downloadAsync()));
    this.setState({ loaded: true });
  }

  _onGLContextCreate = async (gl) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    gl.createRenderbuffer = () => {};
    gl.bindRenderbuffer = () => {};
    gl.renderbufferStorage  = () => {};
    gl.framebufferRenderbuffer  = () => {};

     // ar init
    const arSession = await this._glView.startARSessionAsync();

    // three.js init
    const scene = new THREE.Scene();
    const camera = ExpoTHREE.createARCamera(
      arSession,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      0.01,
      2000
    );

    // init renderer
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    scene.background = ExpoTHREE.createARBackgroundTexture(arSession, renderer);
    
    // const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
    
    // lights
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.3);
    frontLight.position.set(1, 1, 1);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.1);
    backLight.position.set(-1, 0, -1);
    scene.add(backLight);

    const ambLight = new THREE.AmbientLight(0x222222, 0.5);
    scene.add(ambLight);

    // yellow lights

    // const frontLeftLight = new THREE.DirectionalLight(0xFFAB00, 0.1);
    // frontLeftLight.position.set(0, 3, -3);
    // scene.add(frontLeftLight);

    // const frontRightLight = new THREE.DirectionalLight(0xFFAB00, 0.1);
    // frontRightLight.position.set(0, 3, 3);
    // scene.add(frontRightLight);

    // venus material
    const venusMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } )

    // const topLight =  new THREE.PointLight( 0xffffff, 1, 1 );
    // topLight.position.set(2, 30, 2);
    // topLight.castShadow = true;
    // scene.add(topLight);

    // const planeGeometry = new THREE.PlaneGeometry( 50, 50 );
    // planeGeometry.rotateX( - Math.PI / 2 );
    
    const planeMaterial = new THREE.ShadowMaterial();
    planeMaterial.opacity = 0.5;
    
    // const plane = new THREE.Mesh( planeGeometry, venusMaterial );
    // plane.position.y = -1;
    // plane.receiveShadow = true;
    // scene.add( plane );

    //Create a PointLight and turn on shadows for the light
    var light = new THREE.PointLight( 0xffffff, 1, 50 );
    light.position.set( 0, 30, -30 );
    light.castShadow = true;            // default false
    scene.add( light );

    //Set up shadow properties for the light
    light.shadow.mapSize.width = 512;  // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;       // default
    light.shadow.camera.far = 500      // default

    //Create a sphere that cast shadows (but does not receive them)
    // var sphereGeometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    // var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    // var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    // sphere.castShadow = true; //default is false
    // sphere.receiveShadow = false; //default
    // scene.add( sphere );

    //Create a plane that receives shadows (but does not cast them)
    var planeGeometry = new THREE.PlaneBufferGeometry( 20, 20, 32, 32 );
    planeGeometry.rotateX( - Math.PI / 2 );

    // var planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } )
    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = -0.4;
    plane.receiveShadow = true;
    scene.add( plane );



    // global size of couch model
    // const model_size = 0.38;
    const model_size = 0.38;

    // global position of couch model
    const positionX = 0;
    const positionY = -0.4;
    const positionZ = -1.5;


    // bottom model start
    const bottomModelAsset = Asset.fromModule(couch_bottomOBJ);
    await bottomModelAsset.downloadAsync();

    const bottom_assets_loader = new THREE.OBJLoader();

    const bottom_model = bottom_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(bottomModelAsset.localUri))
    

    const sideLeftModelAsset = Asset.fromModule(couch_side_leftOBJ);
      await sideLeftModelAsset.downloadAsync();

    const side_left_assets_loader = new THREE.OBJLoader();

    const side_left_model = side_left_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(sideLeftModelAsset.localUri))


    const sideRightModelAsset = Asset.fromModule(couch_side_rightOBJ);
      await sideRightModelAsset.downloadAsync();

    const side_right_assets_loader = new THREE.OBJLoader();

    const side_right_model = side_right_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(sideRightModelAsset.localUri))

    const couchBackModelAsset = Asset.fromModule(couch_backOBJ);
      await couchBackModelAsset.downloadAsync();

    const couch_back_assets_loader = new THREE.OBJLoader();

    const couch_back_model = couch_back_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(couchBackModelAsset.localUri))


    const couchSeatLeftModelAsset = Asset.fromModule(couch_seat_leftOBJ);
      await couchSeatLeftModelAsset.downloadAsync();

    const couch_seat_left_assets_loader = new THREE.OBJLoader();

    const couch_seat_left_model = couch_seat_left_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(couchSeatLeftModelAsset.localUri))


    const couchPillowRightModelAsset = Asset.fromModule(couch_pillow_rightOBJ);
      await couchPillowRightModelAsset.downloadAsync();

    const couch_pillow_right_assets_loader = new THREE.OBJLoader();

    const couch_pillow_right_model = couch_pillow_right_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(couchPillowRightModelAsset.localUri))


    const couchSeatRightModelAsset = Asset.fromModule(couch_seat_rightOBJ);
      await couchSeatRightModelAsset.downloadAsync();

    const couch_seat_right_assets_loader = new THREE.OBJLoader();

    const couch_seat_right_model = couch_seat_right_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(couchSeatRightModelAsset.localUri))

    const couchPillowLeftModelAsset = Asset.fromModule(couch_pillow_leftOBJ);
      await couchPillowLeftModelAsset.downloadAsync();

    const couch_pillow_left_assets_loader = new THREE.OBJLoader();

    const couch_pillow_left_model = couch_pillow_left_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(couchPillowLeftModelAsset.localUri))
      
    const couchBaseModelAsset = Asset.fromModule(couch_baseOBJ);
      await couchBaseModelAsset.downloadAsync();

    const couch_base_assets_loader = new THREE.OBJLoader();

    const couch_base_model = couch_base_assets_loader.parse(
      await Expo.FileSystem.readAsStringAsync(couchBaseModelAsset.localUri))
      
     // couch texture
    const textureAsset = Asset.fromModule(fabric_material);

    const fabricTexture = new THREE.Texture();

    fabricTexture.image = {
      data: textureAsset,
      width: textureAsset.width,
      height: textureAsset.height,
    };
    
    fabricTexture.wrapS = THREE.RepeatWrapping;
    fabricTexture.wrapT = THREE.RepeatWrapping;
    fabricTexture.needsUpdate = true;
    fabricTexture.isDataTexture = true; // send to gl.texImage2D() verbatim
    fabricTexture.minFilter = THREE.NearestFilter;

    const couchMaterial =  new THREE.MeshBasicMaterial({map: fabricTexture}); 

    // couch base texture
    const woodTextureAsset = Asset.fromModule(base_material);
      
    const woodTexture = new THREE.Texture();
      
    woodTexture.image = {
      data: woodTextureAsset,
      width: woodTextureAsset.width,
      height: woodTextureAsset.height,
    };

    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.needsUpdate = true;
    woodTexture.isDataTexture = true; // send to gl.texImage2D() verbatim
    
    const baseMaterial =  new THREE.MeshPhongMaterial({map: woodTexture});
      

    //  scaleLongestSideToSize(couch_base_model, 0.38);

       
const couchLoader = () => {
  
      bottom_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      bottom_model.position.y = positionY;
      bottom_model.position.z = positionZ;
  
      bottom_model.scale.x = model_size;
      bottom_model.scale.y = model_size;
      bottom_model.scale.z = model_size;
      bottom_model.castShadow = true;
      scene.add(bottom_model);
      // bottom model start
  
      // side left start
  
      side_left_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      side_left_model.position.y = positionY;
      side_left_model.position.z = positionZ;
  
      side_left_model.scale.x = model_size;
      side_left_model.scale.y = model_size;
      side_left_model.scale.z = model_size;
      side_left_model.castShadow = true;
      scene.add(side_left_model);
      // side left ends
  
      // side right start
      side_right_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      side_right_model.position.y = positionY;
      side_right_model.position.z = positionZ;
  
      side_right_model.scale.x = model_size;
      side_right_model.scale.y = model_size;
      side_right_model.scale.z = model_size;
      side_right_model.castShadow = true;
      scene.add(side_right_model);
      // side right ends
  
      // couch back start
  
  
      couch_back_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      couch_back_model.position.y = positionY;
      couch_back_model.position.z = positionZ;
  
      couch_back_model.scale.x = model_size;
      couch_back_model.scale.y = model_size;
      couch_back_model.scale.z = model_size;
      couch_back_model.castShadow = true;
      scene.add(couch_back_model);
      // couch back start
  
      // couch seat left start
  
      couch_seat_left_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      couch_seat_left_model.position.y = positionY;
      couch_seat_left_model.position.z = positionZ;
  
      couch_seat_left_model.scale.x = model_size;
      couch_seat_left_model.scale.y = model_size;
      couch_seat_left_model.scale.z = model_size;
      couch_seat_left_model.castShadow = true;
      scene.add(couch_seat_left_model);
      // couch seat left ends
  
      // couch seat right start
      couch_seat_right_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      couch_seat_right_model.position.y = positionY;
      couch_seat_right_model.position.z = positionZ;
  
      couch_seat_right_model.scale.x = model_size;
      couch_seat_right_model.scale.y = model_size;
      couch_seat_right_model.scale.z = model_size;
      couch_seat_right_model.castShadow = true;
      scene.add(couch_seat_right_model);
      // couch seat right ends
  
      // couch pillow left start
      couch_pillow_left_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      couch_pillow_left_model.position.y = positionY;
      couch_pillow_left_model.position.z = positionZ;
  
      couch_pillow_left_model.scale.x = model_size;
      couch_pillow_left_model.scale.y = model_size;
      couch_pillow_left_model.scale.z = model_size;
      couch_pillow_left_model.castShadow = true;
      scene.add(couch_pillow_left_model);
      // couch pillow left start
  
      // couch pillow right start
      couch_pillow_right_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = couchMaterial;
        }
      });
  
      couch_pillow_right_model.position.y = positionY;
      couch_pillow_right_model.position.z = positionZ;
  
      couch_pillow_right_model.scale.x = model_size;
      couch_pillow_right_model.scale.y = model_size;
      couch_pillow_right_model.scale.z = model_size;
      couch_pillow_right_model.castShadow = true;
      scene.add(couch_pillow_right_model);
      // couch pillow right start
  
      // couch base start
      couch_base_model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = baseMaterial;
        }
      });
  
      couch_base_model.position.y = positionY;
      couch_base_model.position.z = positionZ;
  
      couch_base_model.scale.x = model_size;
      couch_base_model.scale.y = model_size;
      couch_base_model.scale.z = model_size;
      couch_base_model.castShadow = true;
      scene.add(couch_base_model);
      // couch base start
    }


    // animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      gl.endFrameEXP();
      
    }
    animate();
    couchLoader();
  }
}

 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

