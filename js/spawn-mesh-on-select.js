WL.registerComponent('spawn-mesh-on-select', {
    /* The mesh to spawn */
    mesh: {type: WL.Type.Mesh},
    /* The material to spawn the mesh with */
    material: {type: WL.Type.Material},
}, {
    start: function() {
        /* Once a session starts, we want to bind event listeners
         * to the session */
        WL.onXRSessionStart.push(this.onXRSessionStart.bind(this));
    },

    onXRSessionStart: function(s) {
        /* We set this function up to get called when a session starts.
         * The 'select' event happens either on touch or when the trigger
         * button of a controller is pressed.
         * Once that event is triggered, we want spawnMesh() to be called. */
        s.addEventListener('select', this.spawnMesh.bind(this));
    },

    spawnMesh: function() {

        console.log("Spawning the mesh", this.object.scalingWorld);
        /* Create a new object in the scene */
        const o = WL.scene.addObject();
        /* Place new object at current cursor location */
        o.transformLocal = this.object.transformWorld;
        o.scale([0.25, 0.25, 0.25]);
        /* Move out of the floor, at 0.25 scale, the origin of
         * our cube is 0.25 above the floor */
        o.translate([0.0, 0.25, 0.0]);

        /* Add a mesh to render the object */
        const mesh = o.addComponent('mesh');
        mesh.material = this.material;
        mesh.mesh = this.mesh;
        mesh.active = true;
    },
});
