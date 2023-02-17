import ARProvider from "../../AR-provider";

/**
  * Array of extra permissions which some tracking mode might need. By default XR8 will need camera/microphone permissions and deviceMotion permission (iOS only). VPS for example must pass an extra 'location' permission
  */
export type XR8ExtraPermissions = Array<'location'>;

class XR8Provider extends ARProvider {
  // Loading of 8thwall might be initiated by several components, make sure we load it only once
  private loading = false

  public async load() {
    // Make sure we're no in the editor
    if (!window.document) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    return new Promise<void>((resolve, _reject) => {
      // Just some safety flag, if 8thwall was loaded before by something, like a index.html file
      if (window['XR8']) {
        resolve();
        return;
      }

      if (!API_TOKEN_XR8) {
        throw new Error('8thwall api is not defined');
      }

      const s = document.createElement('script');
      s.crossOrigin = 'anonymous';
      s.src = 'https://apps.8thwall.com/xrweb?appKey=' + API_TOKEN_XR8;
      /*s.onload = () => {
        document.querySelector('#WL-loading-8thwall-logo')?.remove();
        resolve();
      }**/

      window.addEventListener('xrloaded', () => {
        this.loaded = true;

        document.querySelector('#WL-loading-8thwall-logo')?.remove();

        XR8.addCameraPipelineModules([
          XR8.GlTextureRenderer.pipelineModule(),
          {
            name: 'WLE-XR8-setup',
            onStart: () => {
              this.enableCameraFeed();
            },
            onException: (message) => {
              // console.log('Error happened', err);
              window.dispatchEvent(new CustomEvent('8thwall-error', { detail: { message } }))
            }
          }
        ]);
        resolve();
      });

      document.body.appendChild(s);
      // Wait until index.html has been fully parsed and append the 8thwall logo
      document.readyState === 'complete' ? this.add8thwallLogo() : document.addEventListener('DOMContentLoaded', () => this.add8thwallLogo);
    })
  };

  public async startSession(options: Parameters<typeof XR8.run>[0]) {
    XR8.run(options)
    this.onSessionStarted.forEach(cb => cb(this));
  };

  public async endSession() {
    XR8.stop();
    this.onSessionEnded.forEach(cb => cb(this));
  };

  public enableCameraFeed() {
    // TODO: should we store the previous state of colorClearEnabled.
    WL.scene.colorClearEnabled = false;

    if (!WL.scene.onPreRender.includes(this.onWLPreRender)) {
      WL.scene.onPreRender.push(this.onWLPreRender)
    }

    if (!WL.scene.onPostRender.includes(this.onWLPostRender)) {
      WL.scene.onPostRender.push(this.onWLPostRender)
    }
  };

  public disableCameraFeed() {
    const indexPrerender = WL.scene.onPreRender.indexOf(this.onWLPreRender);
    if (indexPrerender !== -1) {
      WL.scene.onPreRender.splice(indexPrerender);
    }

    const indexPostRender = WL.scene.onPreRender.indexOf(this.onWLPostRender);
    if (indexPostRender !== -1) {
      WL.scene.onPostRender.splice(indexPostRender);
    }
  };

  public onWLPreRender() {
    Module.ctx.bindFramebuffer(Module.ctx.DRAW_FRAMEBUFFER, null); // <--- Should not be needed after next nightly is released (current 20230110)
    XR8.runPreRender(Date.now());
    XR8.runRender(); // <--- tell 8thwall to do it's thing (alternatively call this.GlTextureRenderer.onRender() if you only care about camera feed )
  };

  public onWLPostRender() {
    XR8.runPostRender(Date.now())
  };

  private add8thwallLogo() {
    const a = document.createElement('a');
    a.href = 'https://www.8thwall.com/';
    a.target = '_blank';
    a.style.position = 'absolute';
    a.style.bottom = '20px';
    a.style.left = '0';
    a.style.right = '0';
    a.style.margin = '0 auto';
    a.style.width = '252px';
    a.style.zIndex = '999';
    // a.style.pointerEvents='none';
    a.id = 'WL-loading-8thwall-logo';
    a.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="252px" height="48px" viewBox="0 0 252 48" style="enable-background:new 0 0 252 48;" xml:space="preserve"><script xmlns=""/>
      <style type="text/css">
        .st0{fill:#fff;}
      </style>
      <g id="Logo_-_Shape">
        <path class="st0" d="M8.32466,26.20464c-0.67188-0.42676-1.46289-0.64062-2.37305-0.64062   c-0.92383,0-1.71484,0.23096-2.37305,0.69287c-0.48096,0.33765-0.84302,0.75977-1.0918,1.26208v-0.94714   c0-0.32178-0.08105-0.56299-0.24121-0.72412c-0.16113-0.16113-0.39551-0.2417-0.7041-0.2417   c-0.29395,0-0.52441,0.08057-0.69238,0.2417s-0.25195,0.40234-0.25195,0.72412v12.36914c0,0.30762,0.08398,0.5459,0.25195,0.71387   s0.39844,0.25195,0.69238,0.25195c0.30859,0,0.54688-0.08398,0.71484-0.25195s0.25195-0.40625,0.25195-0.71387v-4.71436   c0.24902,0.4942,0.61108,0.91217,1.0918,1.24951c0.6582,0.46191,1.44141,0.69287,2.35156,0.69287s1.7041-0.21338,2.38379-0.64062   c0.67871-0.42676,1.2041-1.04248,1.5752-1.84766c0.37012-0.80518,0.55664-1.74658,0.55664-2.82471   c0-1.0918-0.18945-2.0332-0.56738-2.82471c-0.37793-0.79053-0.90332-1.39941-1.5752-1.82666L8.32466,26.20464z M8.15669,32.93511   c-0.25195,0.56006-0.60547,0.98682-1.06055,1.28076s-0.9834,0.44092-1.58496,0.44092c-0.92383,0-1.65918-0.3252-2.20508-0.97607   c-0.5459-0.65137-0.81934-1.59277-0.81934-2.82471c0-0.82568,0.12207-1.51904,0.36719-2.0791   c0.24512-0.55957,0.5957-0.9834,1.05078-1.27051c0.4541-0.28662,0.99023-0.43018,1.60645-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81836,1.58203,0.81836,2.81396   C8.53462,31.68217,8.40864,32.37504,8.15669,32.93511z"/>
        <path class="st0" d="M19.89595,26.21489c-0.74219-0.43359-1.61719-0.65088-2.625-0.65088   c-0.75586,0-1.43848,0.12256-2.04785,0.36768c-0.6084,0.24512-1.12988,0.59814-1.56445,1.06055   c-0.43359,0.46191-0.76562,1.01807-0.99707,1.66943c-0.23145,0.65088-0.34668,1.38281-0.34668,2.19434   c0,1.07812,0.20312,2.01611,0.60938,2.81396c0.40527,0.79785,0.97949,1.41406,1.72168,1.84814s1.61719,0.65088,2.625,0.65088   c0.75586,0,1.43848-0.12256,2.04785-0.36768c0.6084-0.24463,1.12988-0.59814,1.56445-1.06006   c0.43359-0.4624,0.7666-1.02197,0.99707-1.68018c0.23145-0.65771,0.34668-1.39307,0.34668-2.20508   c0-1.07764-0.20312-2.01221-0.60938-2.80371C21.21138,27.26175,20.63814,26.64896,19.89595,26.21489z M19.9272,32.9351   c-0.24512,0.56006-0.59473,0.98682-1.0498,1.28076s-0.99023,0.44092-1.60645,0.44092c-0.91016,0-1.6416-0.3252-2.19434-0.97607   c-0.55371-0.65137-0.8291-1.59277-0.8291-2.82471c0-0.82568,0.12598-1.51904,0.37793-2.0791   c0.25195-0.55957,0.60547-0.9834,1.06055-1.27051c0.4541-0.28662,0.9834-0.43018,1.58496-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81934,1.58203,0.81934,2.81396   C20.29537,31.68217,20.17232,32.37503,19.9272,32.9351z"/>
        <path class="st0" d="M39.13228,25.606c-0.22461,0-0.41309,0.05273-0.56738,0.15771s-0.28027,0.29736-0.37793,0.57715   l-2.65674,7.42999l-2.65674-7.42999c-0.07031-0.25195-0.18848-0.43701-0.35645-0.55615S32.13911,25.606,31.88716,25.606   c-0.23828,0-0.43848,0.05957-0.59863,0.17871c-0.16113,0.11914-0.29102,0.3042-0.38867,0.55615l-2.68506,7.40179l-2.60693-7.3598   c-0.09766-0.29395-0.2168-0.49658-0.35742-0.60889c-0.13965-0.11182-0.3291-0.16797-0.56641-0.16797   c-0.25195,0-0.45508,0.05615-0.60938,0.16797c-0.1543,0.1123-0.25195,0.26611-0.29395,0.46191   c-0.04199,0.19629-0.01367,0.42725,0.08398,0.69336l3.12891,8.33691c0.1123,0.30811,0.26562,0.52832,0.46191,0.66113   c0.19629,0.1333,0.42676,0.19971,0.69336,0.19971c0.28027,0,0.51758-0.07031,0.71387-0.20996s0.34961-0.35693,0.46191-0.65088   l2.52002-6.90814l2.52002,6.90814c0.1123,0.29395,0.26953,0.51123,0.47266,0.65088s0.4375,0.20996,0.70312,0.20996   c0.2666,0,0.50098-0.07031,0.7041-0.20996c0.20215-0.13965,0.35352-0.35693,0.45117-0.65088l3.12891-8.33691   c0.08398-0.22412,0.11523-0.4375,0.09473-0.64062c-0.02148-0.20264-0.09473-0.36768-0.2207-0.49365   S39.38424,25.606,39.13228,25.606z"/>
        <path class="st0" d="M50.71333,31.1187c0.13281-0.11914,0.19922-0.29053,0.19922-0.51465c0-0.78369-0.10156-1.4873-0.30469-2.11035   s-0.50098-1.15137-0.89258-1.58545s-0.86426-0.7666-1.41699-0.99756c-0.55371-0.23096-1.17285-0.34668-1.8584-0.34668   c-0.9668,0-1.82422,0.22412-2.57324,0.67188c-0.74902,0.44824-1.33691,1.07129-1.76367,1.86914s-0.64062,1.729-0.64062,2.79297   c0,1.07812,0.2168,2.0127,0.65137,2.80371c0.43359,0.79102,1.0459,1.3999,1.83691,1.82666   c0.79102,0.42725,1.74023,0.64062,2.8457,0.64062c0.58789,0,1.2002-0.0874,1.83789-0.2627   c0.63672-0.1748,1.18652-0.42285,1.64844-0.74512c0.19531-0.12598,0.3291-0.27295,0.39844-0.44092   c0.07031-0.16846,0.0918-0.32568,0.06348-0.47266s-0.09863-0.27295-0.20996-0.37793   c-0.1123-0.10498-0.25586-0.16113-0.43066-0.16797s-0.36719,0.05225-0.57715,0.17822   c-0.43457,0.29395-0.88574,0.49707-1.35449,0.60889c-0.46973,0.1123-0.92773,0.16797-1.37598,0.16797   c-1.13379,0-2.00195-0.32178-2.60352-0.96582c-0.52417-0.55981-0.80591-1.36755-0.87402-2.39404h6.81641   c0.25195,0,0.44434-0.05908,0.57812-0.17822L50.71333,31.1187z M43.34639,30.07915c0.05298-0.48199,0.14478-0.93707,0.32104-1.3335   c0.25195-0.56689,0.61621-1.0083,1.0918-1.32324c0.47656-0.31494,1.05078-0.47217,1.72266-0.47217   c0.61523,0,1.12988,0.13281,1.54297,0.39893s0.72754,0.6543,0.94531,1.16553c0.1853,0.43689,0.27466,0.96936,0.30151,1.56445   C49.27168,30.07915,43.34639,30.07915,43.34639,30.07915z"/>
        <path class="st0" d="M58.5356,25.54301c-0.93848,0.05615-1.71484,0.30127-2.33105,0.73486   c-0.45923,0.32343-0.80859,0.76044-1.0498,1.3092v-1.01526c0-0.32178-0.08105-0.56299-0.24219-0.72412   s-0.3877-0.2417-0.68262-0.2417c-0.29395,0-0.52441,0.08057-0.69238,0.2417s-0.25195,0.40234-0.25195,0.72412v8.56836   c0,0.32227,0.08398,0.56689,0.25195,0.73486s0.41309,0.25195,0.73438,0.25195c0.30859,0,0.54297-0.08398,0.7041-0.25195   s0.24121-0.4126,0.24121-0.73486v-4.91406c0-0.88232,0.24902-1.5752,0.74609-2.0791   c0.49609-0.50391,1.20703-0.80469,2.13086-0.90283l0.37793-0.021c0.29395-0.02783,0.51074-0.12256,0.65137-0.28369   c0.13965-0.16064,0.20312-0.37451,0.18848-0.64062c-0.01367-0.27979-0.09082-0.479-0.23047-0.59814   c-0.14062-0.11914-0.32227-0.17139-0.5459-0.15771L58.5356,25.54301z"/>
        <path class="st0" d="M69.44575,31.1187c0.13281-0.11914,0.19922-0.29053,0.19922-0.51465c0-0.78369-0.10156-1.4873-0.30469-2.11035   s-0.50098-1.15137-0.89258-1.58545s-0.86426-0.7666-1.41699-0.99756c-0.55371-0.23096-1.17285-0.34668-1.8584-0.34668   c-0.9668,0-1.82422,0.22412-2.57324,0.67188c-0.74902,0.44824-1.33691,1.07129-1.76367,1.86914s-0.64062,1.729-0.64062,2.79297   c0,1.07812,0.2168,2.0127,0.65137,2.80371c0.43359,0.79102,1.0459,1.3999,1.83691,1.82666   c0.79102,0.42725,1.74023,0.64062,2.8457,0.64062c0.58789,0,1.2002-0.0874,1.83789-0.2627   c0.63672-0.1748,1.18652-0.42285,1.64844-0.74512c0.19531-0.12598,0.3291-0.27295,0.39844-0.44092   c0.07031-0.16846,0.0918-0.32568,0.06348-0.47266s-0.09863-0.27295-0.20996-0.37793   c-0.1123-0.10498-0.25586-0.16113-0.43066-0.16797s-0.36719,0.05225-0.57715,0.17822   c-0.43457,0.29395-0.88574,0.49707-1.35449,0.60889c-0.46973,0.1123-0.92773,0.16797-1.37598,0.16797   c-1.13379,0-2.00195-0.32178-2.60352-0.96582c-0.52417-0.55981-0.80591-1.36755-0.87402-2.39404h6.81641   c0.25195,0,0.44434-0.05908,0.57812-0.17822L69.44575,31.1187z M62.07881,30.07915c0.05298-0.48199,0.14478-0.93707,0.32104-1.3335   c0.25195-0.56689,0.61621-1.0083,1.0918-1.32324c0.47656-0.31494,1.05078-0.47217,1.72266-0.47217   c0.61523,0,1.12988,0.13281,1.54297,0.39893s0.72754,0.6543,0.94531,1.16553c0.1853,0.43689,0.27466,0.96936,0.30151,1.56445   C68.0041,30.07915,62.07882,30.07915,62.07881,30.07915z"/>
        <path class="st0" d="M80.31294,21.02788c-0.30859,0-0.54297,0.08105-0.7041,0.2417   c-0.16016,0.16113-0.24121,0.40234-0.24121,0.72461v5.49274c-0.24927-0.49304-0.61084-0.90784-1.0918-1.2403   c-0.6582-0.45508-1.44238-0.68262-2.35156-0.68262c-0.91113,0-1.70508,0.21387-2.38379,0.64062   c-0.67969,0.42725-1.2041,1.03613-1.5752,1.82666c-0.37109,0.7915-0.55664,1.73291-0.55664,2.82471   c0,1.07812,0.18945,2.01953,0.56738,2.82471s0.90625,1.4209,1.58496,1.84766c0.67969,0.42725,1.4668,0.64062,2.36328,0.64062   c0.90918,0,1.69727-0.23096,2.3623-0.69287c0.47998-0.3338,0.83789-0.75476,1.08105-1.2569v0.92096   c0,0.32227,0.08398,0.56689,0.25195,0.73486s0.39941,0.25195,0.69336,0.25195c0.30762,0,0.5459-0.08398,0.71387-0.25195   s0.25195-0.4126,0.25195-0.73486v-13.146c0-0.32227-0.08398-0.56348-0.25195-0.72461   c-0.16797-0.16064-0.40625-0.2417-0.71387-0.2417L80.31294,21.02788z M79.02095,32.93511   c-0.24512,0.56006-0.59473,0.98682-1.0498,1.28076s-0.99023,0.44092-1.60645,0.44092c-0.91016,0-1.6416-0.3252-2.19434-0.97607   c-0.55371-0.65137-0.8291-1.59277-0.8291-2.82471c0-0.82568,0.12598-1.51904,0.37793-2.0791   c0.25195-0.55957,0.60547-0.9834,1.06055-1.27051c0.4541-0.28662,0.9834-0.43018,1.58496-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81934,1.58203,0.81934,2.81396   C79.38911,31.68218,79.26607,32.37505,79.02095,32.93511z"/>
        <path class="st0" d="M97.56392,26.20464c-0.67969-0.42676-1.47363-0.64062-2.38379-0.64062s-1.69336,0.22754-2.35156,0.68262   c-0.48071,0.33234-0.84277,0.74695-1.0918,1.23969V21.9942c0-0.32227-0.08398-0.56348-0.25195-0.72461   c-0.16797-0.16064-0.40625-0.2417-0.71484-0.2417c-0.29395,0-0.52441,0.08105-0.69238,0.2417   c-0.16797,0.16113-0.25195,0.40234-0.25195,0.72461v13.146c0,0.32227,0.08398,0.56689,0.25195,0.73486   s0.39844,0.25195,0.69238,0.25195c0.30859,0,0.54297-0.08398,0.7041-0.25195c0.16016-0.16797,0.24121-0.4126,0.24121-0.73486   v-0.93738c0.24878,0.50977,0.61084,0.93567,1.0918,1.27332c0.6582,0.46191,1.44922,0.69287,2.37305,0.69287   c0.91016,0,1.70117-0.21338,2.37305-0.64062c0.67188-0.42676,1.19727-1.04248,1.5752-1.84766s0.56738-1.74658,0.56738-2.82471   c0-1.0918-0.18652-2.0332-0.55664-2.82471C98.76803,27.24077,98.24265,26.63189,97.56392,26.20464z M97.38521,32.93511   c-0.25195,0.56006-0.60547,0.98682-1.06055,1.28076s-0.9834,0.44092-1.58496,0.44092c-0.92383,0-1.65918-0.3252-2.20508-0.97607   c-0.5459-0.65137-0.81934-1.59277-0.81934-2.82471c0-0.82568,0.12207-1.51904,0.36719-2.0791   c0.24512-0.55957,0.5957-0.9834,1.05078-1.27051c0.4541-0.28662,0.99023-0.43018,1.60645-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81836,1.58203,0.81836,2.81396   C97.76314,31.68217,97.63716,32.37504,97.38521,32.93511z"/>
        <path class="st0" d="M110.56197,25.79497c-0.13281-0.12598-0.31836-0.18896-0.55664-0.18896   c-0.26562,0-0.47559,0.05615-0.62988,0.16797c-0.1543,0.1123-0.28711,0.30811-0.39844,0.58789l-3.06348,7.4093l-3.00586-7.4093   c-0.12598-0.27979-0.25879-0.47559-0.39941-0.58789c-0.13965-0.11182-0.3291-0.16797-0.56641-0.16797   c-0.28027,0-0.50098,0.06299-0.66211,0.18896s-0.25488,0.28711-0.2832,0.48291c-0.02832,0.19629,0.00684,0.41309,0.10547,0.65137   l3.79492,8.83533l-1.25391,2.84045c-0.09863,0.22363-0.13672,0.4375-0.11621,0.64062   c0.02148,0.20264,0.10547,0.36377,0.25195,0.48291c0.14746,0.11865,0.33301,0.17822,0.55664,0.17822   c0.26562,0,0.47266-0.05225,0.62012-0.15723c0.14648-0.10498,0.29004-0.30469,0.42969-0.59863l5.29199-12.24268   c0.1123-0.22412,0.1543-0.43408,0.12598-0.63037C110.77585,26.08207,110.69479,25.92094,110.56197,25.79497z"/>
        <path class="st0" d="M199.81953,12.86967h48.86694c1.65649,0,2.99902-1.34271,2.99902-2.99896V2.99895   c0-1.65625-1.34253-2.99897-2.99902-2.99897h-48.86694c-1.65625,0-2.99902,1.34271-2.99902,2.99896v6.87177   C196.82051,11.52696,198.16328,12.86967,199.81953,12.86967z M197.0461,2.99894c0-1.52924,1.24438-2.77338,2.77344-2.77338   h48.86694c1.5293,0,2.77344,1.24414,2.77344,2.77338v6.87177c0,1.52924-1.24414,2.77338-2.77344,2.77338h-48.86694   c-1.52905,0-2.77344-1.24414-2.77344-2.77338V2.99895V2.99894z"/>
        <polygon class="st0" points="202.23286,5.93364 205.82661,9.72191 206.41499,9.72191 206.41499,3.15282 205.00337,3.15282    205.00337,6.98357 201.39839,3.18553 201.36958,3.15282 200.81929,3.15282 200.81929,9.72191 202.23286,9.72191  "/>
        <rect x="209.40913" y="3.14769" class="st0" width="1.40796" height="6.57422"/>
        <polygon class="st0" points="223.83028,5.93364 227.42451,9.72191 228.01216,9.72191 228.01216,3.15282 226.60152,3.15282    226.60152,6.98357 222.96529,3.15282 222.41695,3.15282 222.41695,9.72191 223.83028,9.72191  "/>
        <polygon class="st0" points="232.66743,9.72191 234.07954,9.72191 234.07954,4.55247 236.09102,4.55247 236.09102,3.15282    230.65767,3.15282 230.65767,4.55247 232.66743,4.55247  "/>
        <rect x="238.77168" y="3.14769" class="st0" width="1.40698" height="6.57422"/>
        <path class="st0" d="M246.04585,9.72173h0.00024c0.82788,0,1.44165-0.25317,2.11841-0.87372l0.07739-0.07013l-0.93896-1.08508   l-0.07568,0.06543c-0.37427,0.3186-0.65845,0.48047-1.17383,0.48047c-0.51099,0-0.92725-0.16498-1.23706-0.49017   c-0.31128-0.32434-0.47046-0.77271-0.47339-1.33203c0-0.52155,0.15747-0.95312,0.46826-1.28278   c0.30933-0.33093,0.72485-0.49988,1.23486-0.50232c0.50269,0,0.79248,0.16364,1.18188,0.48621l0.07593,0.06165l0.93774-1.08063   l-0.07666-0.07056c-0.67529-0.6217-1.28931-0.87549-2.1189-0.87549c-0.87671,0-1.6228,0.31793-2.21729,0.94495   c-0.59375,0.62854-0.896,1.41162-0.89795,2.32782c0,0.93585,0.30127,1.72711,0.89551,2.35144   c0.59692,0.62372,1.34375,0.94165,2.21948,0.94495V9.72173z"/>
        <path class="st0" d="M215.33199,8.74687h2.59424l0.36157,0.97504l1.50562-0.00549l-2.49023-6.56372h-1.34766l-2.43896,6.42389   l-0.0542,0.14532h1.50854C214.9709,9.72191,215.33199,8.74687,215.33199,8.74687z M216.65889,5.18736l0.76685,2.08191   l-1.57031,0.01886L216.65889,5.18736z"/>
        <path class="st0" d="M210.17964,18.56548c-0.97754,0.00049-1.80859,0.66742-2.01685,1.6059l-4.29419,16.09668l-3.52295-14.42322   c-0.229-0.92432-1.05518-1.57074-2.0083-1.57123h-3.05225c-0.95215,0.00049-1.77808,0.64642-2.00806,1.57269l-3.52026,14.42126   l-4.29004-16.08099c-0.2124-0.95367-1.04321-1.62061-2.02075-1.62109h-3.75513l6.83276,24.40314l0.07739,0.27399h4.58276   c0.93848-0.00391,1.75952-0.63898,1.99536-1.5462c1.02563-3.91199,2.85474-11.60242,3.63281-14.89099   c0.77783,3.28857,2.60889,10.979,3.6333,14.89099c0.23706,0.90723,1.05811,1.5423,1.99658,1.5462h4.58276l6.90991-24.67712   h-3.75488V18.56548z"/>
        <path class="st0" d="M172.43257,24.41563c-1.19971-0.65521-2.59717-0.99677-3.9104-0.96295   c-1.2019-0.00934-2.35962,0.22845-3.45068,0.71436c-0.62329,0.27063-1.24487,0.74719-1.88379,1.44788v-5.02808   c0.01367-0.54462-0.18604-1.06183-0.56177-1.45673c-0.37573-0.39435-0.88281-0.61896-1.48755-0.63312h-3.43872v24.73584h3.43677   c0.51978-0.02545,1.05786-0.20551,1.44556-0.58911c0.38745-0.38263,0.60181-0.89349,0.60571-1.46106l-0.00098-8.57263   c-0.09204-1.19147,0.30835-2.54395,0.97681-3.34442c0.72412-0.74225,1.72217-1.14496,2.81641-1.08087   c1.0293-0.06946,2.04712,0.32831,2.74976,1.05981c0.73193,0.87488,1.09302,1.98364,1.01587,3.14771v8.81097   c0,1.12439,0.91504,2.03937,2.03931,2.03937h3.43799V31.75963c0.04199-1.53741-0.28784-3.08362-0.95923-4.47961   c-0.6311-1.22864-1.6106-2.21948-2.83105-2.86438V24.41563z"/>
        <path class="st0" d="M237.79512,19.18938c-0.37207,0.41296-0.58325,0.95996-0.57935,1.49774v20.50433   c-0.00391,0.54413,0.20532,1.05792,0.58911,1.44543c0.38257,0.38751,0.89331,0.60181,1.4502,0.60571h3.43896V18.50774h-3.44092   C238.70601,18.51116,238.18843,18.75286,237.79512,19.18938z"/>
        <path class="st0" d="M251.71968,18.53368h-3.4397c-0.5481,0.00342-1.06079,0.24072-1.44556,0.66888   c-0.36401,0.40466-0.56958,0.94678-0.56665,1.48456v20.50433c-0.00391,0.54413,0.20557,1.05792,0.58911,1.44543   c0.38281,0.38751,0.89355,0.60181,1.45044,0.60571h3.43774C251.74507,43.24259,251.71968,18.53367,251.71968,18.53368z"/>
        <path class="st0" d="M228.15376,25.50676v0.25983c-0.5686-0.57104-1.22803-1.05591-1.9436-1.4278   c-1.17212-0.59937-2.47681-0.8974-3.79004-0.87439c-3.19043-0.06555-6.24268,1.79187-7.66943,4.67828   c-0.80444,1.59167-1.21338,3.37421-1.18311,5.14258c-0.03345,1.78497,0.36792,3.57391,1.16162,5.1734   c0.71631,1.45129,1.82324,2.67114,3.19897,3.52545c1.31055,0.82404,2.81738,1.25848,4.35303,1.25848h0.24463   c1.27515,0,2.54639-0.30432,3.68433-0.88562c0.72241-0.36993,1.38086-0.86017,1.9436-1.44342v0.29553   c0,1.12048,0.91504,2.03253,2.05029,2.03253h3.43774V23.4644h-3.43774C229.07368,23.4644,228.15376,24.38035,228.15376,25.50676z    M227.16475,36.27562c-0.40308,0.7558-1.00317,1.38788-1.72974,1.82477c-0.72974,0.41913-1.56079,0.64099-2.40308,0.64099h-0.00537   c-0.82349,0-1.63062-0.22705-2.33521-0.6582c-0.75488-0.45355-1.37061-1.10443-1.77881-1.87958   c-0.4646-0.89514-0.70142-1.90094-0.68384-2.92505c-0.02393-0.99799,0.21191-1.99023,0.67969-2.86658   c0.41235-0.75214,1.02002-1.38159,1.75269-1.81689c0.73608-0.41864,1.56177-0.62793,2.38745-0.62793   s1.65161,0.20929,2.38745,0.62738c0.75269,0.43005,1.36548,1.06061,1.76953,1.81799   c0.45825,0.89722,0.68799,1.90308,0.66382,2.92505C227.88496,34.35796,227.6418,35.37419,227.16475,36.27562z"/>
        <path class="st0" d="M149.73091,20.4702c0-1.06805-0.76929-1.90472-1.73901-1.90472h-3.36646v5.23816h-0.01831   c-1.41235,0-2.55713,1.14484-2.55713,2.55713v2.58118h2.57544v8.85065c-0.07642,1.67682,0.56665,3.23621,1.55396,4.27911   c0.85132,0.8988,2.01978,1.37341,3.38013,1.37341c1.47363,0,2.61694-0.43219,3.39575-1.28461   c1.20386-1.31818,1.07056-3.14349,1.0647-3.22095l-0.02832-0.34778h-2.49854c-0.58594,0.02466-1.04297-0.12036-1.32886-0.40991   c-0.47266-0.47906-0.44507-1.30536-0.43335-1.65808v-7.58185h1.84814c1.41235,0,2.55713-1.1449,2.55713-2.55713v-2.58118h-4.40527   v-3.33344V20.4702z"/>
        <path class="st0" d="M137.373,14.73643l-6.49268-3.47089c-1.19629-0.63947-2.63281-0.63947-3.8291,0l-6.49292,3.47089   c-1.32129,0.70636-2.14648,2.08307-2.14648,3.58142v6.41565c0,1.49841,0.8252,2.87506,2.14648,3.58142l2.0166,1.07806   l-2.0166,1.078c-1.32129,0.70642-2.14648,2.08307-2.14648,3.58142v6.41565c0,1.49841,0.8252,2.87506,2.14648,3.58142   l6.49292,3.47089c1.19629,0.63947,2.63281,0.63947,3.8291,0l6.49268-3.47089c1.32153-0.70636,2.14648-2.08301,2.14648-3.58142   V34.0524c0-1.49835-0.82495-2.875-2.14648-3.58142l-2.0166-1.078l2.0166-1.07806c1.32153-0.70636,2.14648-2.08301,2.14648-3.58142   v-6.41565C139.51949,16.8195,138.69453,15.44279,137.373,14.73643z M133.87373,38.75199c0,0.69678-0.38379,1.33698-0.99829,1.66547   l-3.01929,1.61407c-0.5564,0.29736-1.22437,0.29736-1.78076,0l-3.01929-1.61407c-0.6145-0.32849-0.99805-0.96869-0.99805-1.66547   v-2.98352c0-0.69678,0.38354-1.33691,0.99805-1.66547l3.01929-1.61407c0.5564-0.29736,1.22437-0.29736,1.78076,0l3.01929,1.61407   c0.6145,0.32855,0.99829,0.96869,0.99829,1.66547V38.75199z M133.87373,23.01743c0,0.69678-0.38379,1.33698-0.99829,1.66547   l-3.01929,1.61407c-0.5564,0.29736-1.22437,0.29736-1.78076,0l-3.01929-1.61407c-0.6145-0.32849-0.99805-0.96869-0.99805-1.66547   v-2.98352c0-0.69678,0.38354-1.33698,0.99805-1.66547l3.01929-1.61407c0.5564-0.29736,1.22437-0.29736,1.78076,0l3.01929,1.61407   c0.6145,0.32849,0.99829,0.96869,0.99829,1.66547V23.01743z"/>
      </g>
      </svg>
    `;
    document.body.appendChild(a);
  };


  private promptForDeviceMotion() {
    return new Promise(async (resolve, reject) => {

      // Tell anyone who's interested that we want to get some user interaction
      window.dispatchEvent(new Event('8thwall-request-user-interaction'));

      // Wait until someone response that user interaction happened
      window.addEventListener('8thwall-safe-to-request-permissions', async () => {
        try {
          const motionEvent = await (DeviceMotionEvent as any).requestPermission();
          resolve(motionEvent);
        } catch (exception) {
          reject(exception)
        }
      });
    })
  }

  private async getPermissions(extraPermissions: XR8ExtraPermissions = []) {
    // iOS "feature". If we want to request the DeviceMotion permission, user has to interact with the page at first (touch it).
    // If there was no interaction done so far, we will render a HTML overlay with would get the user to interact with the screen
    if (DeviceMotionEvent && (DeviceMotionEvent as any).requestPermission) {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();

        // The user must have rejected the motion event on previous page load. (safari remembers this choice).
        if (result !== 'granted') {
          throw new Error('MotionEvent');
        }
      } catch (exception: any) {

        // User had no interaction with the page so far
        if (exception.name === 'NotAllowedError') {
          const motionEvent = await this.promptForDeviceMotion();
          if (motionEvent !== 'granted') {
            throw new Error('MotionEvent');
          }
        } else {
          throw new Error('MotionEvent');
        }
      }
    }

    try {
      // make sure we get the camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

      // If we successfully acquired the camera stream - we can stop it and wait until 8thwall requests it again
      // Update - if we don't stop it, xr8 initialises faster
      /* stream.getTracks().forEach((track) => {
         track.stop();
       });*/

    } catch (exception) {
      throw new Error('Camera');
    }

    if (extraPermissions.includes('location')) {
      window.dispatchEvent(new Event('8thwall-waiting-for-device-location'))
      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
          window.dispatchEvent(new Event('8thwall-device-location-resolved'))
          
          resolve();
        }, (error) => {
          window.dispatchEvent(new Event('8thwall-device-location-resolved'))
          reject("Geolocation");
        });
      });
    }

    return true;
  };

  public async checkPermissions(extraPermissions: XR8ExtraPermissions = []) {
    OverlaysHandler.init();


    if(!XR8.XrDevice.isDeviceBrowserCompatible()) {
      window.dispatchEvent(new CustomEvent('8thwall-device-incompatible'));
      return;
    }
   
    try {
      await this.getPermissions(extraPermissions);
      return true;

    } catch (error) {
      // User did not grant the camera or motionEvent permissions
      console.log("Permission failed", error);
      window.dispatchEvent(new CustomEvent('8thwall-permission-fail', { detail: error }))
      return false;
    }
  }
}


const OverlaysHandler = {
  ready: false, // make sure we initialise only once
  init() {

    if (this.ready) {
      return;
    }
    this.ready = true;
    this.handleRequestUserInteraction = this.handleRequestUserInteraction.bind(this);
    this.handlePermissionFail = this.handlePermissionFail.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleWaitingForDeviceLocation = this.handleWaitingForDeviceLocation.bind(this);
    this.handleDeviceLocationResolved = this.handleDeviceLocationResolved.bind(this);
    this.handleDeviceIncompatible = this.handleDeviceIncompatible.bind(this);

    window.addEventListener('8thwall-request-user-interaction', this.handleRequestUserInteraction);
    window.addEventListener('8thwall-permission-fail', this.handlePermissionFail);
    window.addEventListener('8thwall-error', this.handleError);
    window.addEventListener('8thwall-waiting-for-device-location', this.handleWaitingForDeviceLocation);
    window.addEventListener('8thwall-device-location-resolved', this.handleDeviceLocationResolved);
    window.addEventListener('8thwall-device-incompatible', this.handleDeviceIncompatible);
  },


  handleDeviceIncompatible: function() {
    const overlay = this.showOverlay(deviceIncompatibleOverlay()); 
  },

  handleWaitingForDeviceLocation: function () {
    const overlay = this.showOverlay(handleWaitingForDeviceLocationOverlay);
  },

  handleDeviceLocationResolved: function () {
    const overlay = document.querySelector("#handleWaitingForDeviceLocationOverlay");
    if(overlay) {
      overlay.remove();
    }
  },

  handleRequestUserInteraction: function () {
    const overlay = this.showOverlay(requestPermissionOverlay);
    window.addEventListener('8thwall-safe-to-request-permissions', () => {
      overlay.remove();
    });
  },

  handlePermissionFail: function (_reason: Event) {
    this.showOverlay(failedPermissionOverlay);
  },

  handleError: function (error: Event) {
    console.error('XR8 encountered an error', (error as CustomEvent).detail.message);
    this.showOverlay(runtimeErrorOverlay((error as CustomEvent).detail.message));
  },

  showOverlay: function (htmlContent: string) {
    const overlay = document.createElement('div');
    overlay.innerHTML = htmlContent;
    document.body.appendChild(overlay);
    return overlay;
  }
}

const requestPermissionOverlay = `
  <style>
  #request-permission-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    font-family: sans-serif;
  }

  .request-permission-overlay_title {
    margin: 30px;
    font-size: 32px;
  }

  .request-permission-overlay_button {
    background-color: #e80086;
    font-size: 22px;
    padding: 10px 30px;
    color: #fff;
    border-radius: 15px;
    border: none;
  }
  </style>

  <div id="request-permission-overlay">
    <div class="request-permission-overlay_title">This app requires to use your camera and motion sensors</div>
    <button class="request-permission-overlay_button" onclick="window.dispatchEvent(new Event('8thwall-safe-to-request-permissions'))">OK</button>
  </div>`;

const failedPermissionOverlay = `
  <style>
  #failed-permission-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    font-family: sans-serif;
  }

  .failed-permission-overlay_title {
    margin: 30px;
    font-size: 32px;
  }

  .failed-permission-overlay_button {
    background-color: #e80086;
    font-size: 22px;
    padding: 10px 30px;
    color: #fff;
    border-radius: 15px;
    border: none;
  }
  </style>

  <div id="failed-permission-overlay">
  <div class="failed-permission-overlay_title">Failed to grant permissions. Reset the the permissions and refresh the page.</div>

  <button class="failed-permission-overlay_button" onclick="window.location.reload()">Refresh the page</button>
  </div>`;

const runtimeErrorOverlay = (message: string) => `
  <style>
  #wall-error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    font-family: sans-serif;
  }

  .wall-error-overlay_title {
    margin: 30px;
    font-size: 32px;
  }

  .wall-error-overlay_message {
    margin: 30px;
    font-size: 24px;
  }

  .wall-error-overlay_button {
    background-color: #e80086;
    font-size: 22px;
    padding: 10px 30px;
    color: #fff;
    border-radius: 15px;
    border: none;
  }
  </style>

  <div id="wall-error-overlay">
    <div class="wall-error-overlay_title">Error has occurred. Please reload the page</div>
    <div class="wall-error-overlay_message">${message}</div>

    <button class="wall-error-overlay_button" onclick="window.location.reload()">Reload</button>
  </div>`;

const handleWaitingForDeviceLocationOverlay = `
<style>
#handleWaitingForDeviceLocationOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  
  font-family: sans-serif;

  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>
<div id="handleWaitingForDeviceLocationOverlay">
  Waiting for device location
</div>`;


const deviceIncompatibleOverlay = () => `
<style>
#deviceIncompatibleOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 30px;
  box-sizing: border-box;
  
  font-family: sans-serif;

  display: flex;
  flex-direction: column;

  align-content: center;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}



#incompatible-redirect-QR-code {
  height: 200px;
  width: 200px;
  margin: 30px;
}
</style>
<div id="deviceIncompatibleOverlay">
<div>
  This device is not compatible with 8thwall. 
  Please open it using your mobile device.
  </div>
  <div id="incompatible-redirect-QR-code">
    <img src="https://8th.io/qr?v=2&margin=2&url=${encodeURIComponent(window.location.href)}" />
  </div>
  <div>${window.location.href}</div>
</div>`;


export default new XR8Provider();