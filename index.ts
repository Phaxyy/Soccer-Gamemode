/**
 * HYTOPIA SDK Boilerplate
 * 
 * This is a simple boilerplate to get started on your project.
 * It implements the bare minimum to be able to run and connect
 * to your game server and run around as the basic player entity.
 * 
 * From here you can begin to implement your own game logic
 * or do whatever you want!
 * 
 * You can find documentation here: https://github.com/hytopiagg/sdk/blob/main/docs/server.md
 * 
 * For more in-depth examples, check out the examples folder in the SDK, or you
 * can find it directly on GitHub: https://github.com/hytopiagg/sdk/tree/main/examples/payload-game
 * 
 * You can officially report bugs or request features here: https://github.com/hytopiagg/sdk/issues
 * 
 * To get help, have found a bug, or want to chat with
 * other HYTOPIA devs, join our Discord server:
 * https://discord.gg/DXCXJbHSJX
 * 
 * Official SDK Github repo: https://github.com/hytopiagg/sdk
 * Official SDK NPM Package: https://www.npmjs.com/package/hytopia
 */

import {
  startServer,
  Audio,
  GameServer,
  PlayerEntity,
  Entity,
  Collider,
  ColliderShape,
  RigidBodyType,
  SimpleEntityController,
  otherEntity
} from 'hytopia';

import worldMap from './assets/map.json';

/**
 * startServer is always the entry point for our game.
 * It accepts a single function where we should do any
 * setup necessary for our game. The init function is
 * passed a World instance which is the default
 * world created by the game server on startup.
 * 
 * Documentation: https://github.com/hytopiagg/sdk/blob/main/docs/server.startserver.md
 */

startServer(world => {
  // world.simulation.enableDebugRendering(true);

  // Load our map
  world.loadMap(worldMap);

  // Handle player joining the game
  world.onPlayerJoin = player => {
    const playerEntity = new PlayerEntity({
      player,
      name: 'Player',
      modelUri: 'models/streetguy.glb',
      modelLoopedAnimations: [ 'idle' ],
      modelScale: 0.5,
      rigidBodyOptions: {
        additionalMass: 100,
      }
    });
  
    playerEntity.spawn(world, { x: 0, y: 10, z: 0 });

    world.chatManager.sendPlayerMessage(player, 'Welcome to the game!', '00FF00');
    world.chatManager.sendPlayerMessage(player, 'Use WASD to move around.');
    world.chatManager.sendPlayerMessage(player, 'Press space to jump.');
    world.chatManager.sendPlayerMessage(player, 'Hold shift to sprint.');
    world.chatManager.sendPlayerMessage(player, 'Press \\ to enter or exit debug view.');
  };

  // Handle player leaving the game
  world.onPlayerLeave = player => {
    world.entityManager.getPlayerEntitiesByPlayer(player).forEach(entity => entity.despawn());
  };

  // Easter egg rocket command
  world.chatManager.registerCommand('/rocket', player => {
    world.entityManager.getPlayerEntitiesByPlayer(player).forEach(entity => {
      entity.applyImpulse({ x: 0, y: 20, z: 0 });
    });
  });

  // Play ambient music
  new Audio({
    uri: 'audio/music/overworld.mp3',
    loop: true,
    volume: 0.1,
  }).play(world);

  // Create the football entity with a collider
  const football = new Entity({
    name: 'Football',
    modelUri: 'models/football.glb', // Path to the football model
    modelScale: 1,                     // Adjust scale if needed
    rigidBodyOptions: { linearDamping: .5,
      colliders: [
        { // Add a ball collider for the sand block
          shape: ColliderShape.BALL,  // Ball collider
          radius: .3,               // Set the radius of the collider
          bounciness: .5,
        }
      ]
    }
  });

  // Callback when the football collides with another entity
  football.onEntityCollision = (football, otherEntity, started) => {
    if (!started) { return } // Only care about the initial hit

    // Perform your logic here when the ball hits something
    football.applyImpulse({ x: .6, y: .6, z: .6 });
    world.chatManager.sendBroadcastMessage('The football was kicked!');
  };

  football.onPlayerCollision = (football, otherEntity, started) => {
    if (!started) { return } // Only care about the initial hit

    // Perform your logic here when the ball hits something
    football.applyImpulse({ x: .6, y: .6, z: .6 });
    world.chatManager.sendBroadcastMessage('The football was kicked!');
  };


  // Spawn the football at a location
  football.spawn(world, { x: 1.5, y: 3, z: 2 });



  

  let aggroPlayer: PlayerEntity | undefined;

  const zombie = new Entity({
    controller: new SimpleEntityController(),
    modelUri: 'models/zombie.gltf',
    modelScale: .5,
    modelLoopedAnimations: [ 'run' ],
    

    
  });
  
  // Create a default approximated collider for the hitbox from the model
  // This is the same way the default collider is created internally for an entity
  // if no other colliders are specified.
  zombie.createAndAddChildCollider(Collider.optionsFromModelUri('models/zombie.gltf', .5));
  
  // Add our sensor collider
  zombie.createAndAddChildCollider({
    shape: ColliderShape.CYLINDER,
    radius: 166,
    mass: 5,
    halfHeight: 2,
    isSensor: true, // This makes the collider not collide with other entities/objects, just sense their intersection
    tag: 'aggro-sensor',
    onCollision: (other: BlockType | Entity, started: boolean) => {
      if (started && other instanceof Entity) {
        aggroPlayer = football;
      }
    },
  });
  
  // Some chasing logic from our sensor collider that detects an aggro radius
  // Now, when our player goes within th
  zombie.onTick = () => {
    if (aggroPlayer) {
      // Chase the player
      (zombie.controller as SimpleEntityController).move(aggroPlayer.position, 5);
      (zombie.controller as SimpleEntityController).face(aggroPlayer.position, 3);
    }
  };
  
  zombie.spawn(world, { x: -15, y: 10, z: 0 });
  
  const zombie1 = new Entity({
    controller: new SimpleEntityController(),
    modelUri: 'models/zombie.gltf',
    modelScale: .5,
    modelLoopedAnimations: [ 'run' ],
    

    
  });
  
  // Create a default approximated collider for the hitbox from the model
  // This is the same way the default collider is created internally for an entity
  // if no other colliders are specified.
  zombie1.createAndAddChildCollider(Collider.optionsFromModelUri('models/zombie.gltf', .5));
  
  // Add our sensor collider
  zombie1.createAndAddChildCollider({
    shape: ColliderShape.CYLINDER,
    radius: 166,
    mass: 5,
    halfHeight: 2,
    isSensor: true, // This makes the collider not collide with other entities/objects, just sense their intersection
    tag: 'aggro-sensor',
    onCollision: (other: BlockType | Entity, started: boolean) => {
      if (started && other instanceof Entity) {
        aggroPlayer = football;
      }
    },
  });
  
  // Some chasing logic from our sensor collider that detects an aggro radius
  // Now, when our player goes within th
  zombie1.onTick = () => {
    if (aggroPlayer) {
      // Chase the player
      (zombie1.controller as SimpleEntityController).move(aggroPlayer.position, 5);
      (zombie1.controller as SimpleEntityController).face(aggroPlayer.position, 3);
    }
  };
  
  zombie1.spawn(world, { x: 15, y: 10, z: 0 });
  
  

  
});

