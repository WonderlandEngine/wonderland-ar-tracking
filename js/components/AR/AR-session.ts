enum ARUsage {
  SLAM,
  FACE_TRACKING,
  IMAGE_TRACKING,
};

const ARSession = {
  ARUsage: ARUsage, // Just not to poison the global scope with ARUsage enum, we expose it using ARSession.ARUsage
  usage: null,
  ARSystem: null,

  onARStartClicked: Array<(event: Event) => void>(),

  setUsage: async function (usage: ARUsage, dependencies: any[] = []) {
    this.onWLSceneLoaded = this.onWLSceneLoaded.bind(this);

    // Wait until all the dependencies were loaded
    await Promise.all(dependencies.map(d => d.load()));
    if (!WL.onSceneLoaded.includes(this.onWLSceneLoaded)) {
      WL.onSceneLoaded.push(this.onWLSceneLoaded);
    }
  },

  onWLSceneLoaded: function () {
    /*if (document.querySelector('#ar-button')) {
      return;
    }*/

    console.log('Scene is loaded');

    /*const xrButton = document.createElement('div')
    xrButton.id = 'ar-button';
    xrButton.innerHTML = `
      <svg id="Layer_1" data - name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109.41 65">
        <path class="xr-button-label"
          d="M42.89,15.62a2,2,0,0,1,1.78,1.15L55.75,47A1.84,1.84,0,0,1,54,48.84H48.52a1.81,1.81,0,0,1-1.67-1.2l-1.49-4.19H33.77l-1.49,4.19a1.8,1.8,0,0,1-1.66,1.2H25.17A1.83,1.83,0,0,1,23.39,47L34.46,16.77a2,2,0,0,1,1.78-1.15Zm-6.31,20h6l-3-8.38Z">
        </path>
        <path class="xr-button-label"
          d="M70.61,40H68V47a1.84,1.84,0,0,1-1.78,1.83H61.31A1.83,1.83,0,0,1,59.54,47V17.46a1.83,1.83,0,0,1,1.77-1.84H73s13,.12,13,12.22c0,6-3.21,9-6.42,10.5L86.38,47a1.76,1.76,0,0,1-1.77,1.83h-5.8a1.91,1.91,0,0,1-1.43-.69ZM68,32.09h5c2.24,0,4.08-1.15,4.08-4.25s-1.84-4.36-4.08-4.36H68Z">
        </path>
        <rect class="xr-button-frame" x="3.5" y="3.5" width="102.41" height="58" rx="16.68"
          style="fill:none;stroke-linejoin:round;stroke-width:7px"> </rect>
      </svg>
      `;
    document.querySelector(".xr-button-container")?.appendChild(xrButton);*/
    let xrButton = document.querySelector<HTMLElement>('#ar-button');
    if(xrButton === null) {
      console.error('No #ar-button found. Session will not start.');
      return;
    }
    
    xrButton.addEventListener('click', (event) => {
      // xrButton!.remove();
      xrButton!.style.display = 'none';
      this.startSession();
    });
  },

  startSession: function (event) {
    this.onARStartClicked.forEach(cb => {
      cb(event);
    });
  },

  addARSystem: function (system) {
    if (this.ARSystem) {
      console.error('Adding multiple tracking systems which might result in errors. Current', this.ARSystem, 'next', system);
    }
    this.ARSystem = system;
  }
};

(window as any).ARSession = ARSession;
export default ARSession;