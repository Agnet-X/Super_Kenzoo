/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
  attack: boolean;
  attackJustPressed: boolean;
  run: boolean;
  pauseJustPressed: boolean;
}

export class InputManager {
  private keys: { [code: string]: boolean } = {};
  private keysPrev: { [code: string]: boolean } = {};
  private touchState: Partial<InputState> = {};
  private touchJustPressed: { [key: string]: boolean } = {};

  public state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    jumpJustReleased: false,
    attack: false,
    attackJustPressed: false,
    run: false,
    pauseJustPressed: false,
  };

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.attach();
  }

  public attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Prevent scrolling for game navigation keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    this.keys[e.code] = true;
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

  public setTouchButton(action: keyof InputState, pressed: boolean) {
    const wasPressed = !!this.touchState[action];
    this.touchState[action] = pressed;
    if (pressed && !wasPressed) {
      this.touchJustPressed[action] = true;
    }
  }

  public update() {
    // Check Gamepad
    let gpLeft = false;
    let gpRight = false;
    let gpUp = false;
    let gpDown = false;
    let gpJump = false;
    let gpAttack = false;
    let gpRun = false;
    let gpPause = false;

    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;
        const axesX = gp.axes[0] || 0;
        const axesY = gp.axes[1] || 0;
        if (axesX < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed)) gpLeft = true;
        if (axesX > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed)) gpRight = true;
        if (axesY < -0.3 || (gp.buttons[12] && gp.buttons[12].pressed)) gpUp = true;
        if (axesY > 0.3 || (gp.buttons[13] && gp.buttons[13].pressed)) gpDown = true;
        if ((gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[1] && gp.buttons[1].pressed)) gpJump = true;
        if ((gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[7] && gp.buttons[7].pressed)) gpAttack = true;
        if ((gp.buttons[5] && gp.buttons[5].pressed) || (gp.buttons[6] && gp.buttons[6].pressed)) gpRun = true;
        if (gp.buttons[9] && gp.buttons[9].pressed) gpPause = true;
      }
    }

    // Keyboard mappings
    const kLeft = this.keys['ArrowLeft'] || this.keys['KeyA'] || gpLeft || !!this.touchState.left;
    const kRight = this.keys['ArrowRight'] || this.keys['KeyD'] || gpRight || !!this.touchState.right;
    const kUp = this.keys['ArrowUp'] || this.keys['KeyW'] || gpUp || !!this.touchState.up;
    const kDown = this.keys['ArrowDown'] || this.keys['KeyS'] || gpDown || !!this.touchState.down;
    
    // Jump: ArrowUp, KeyW, KeyZ, KeyK, or gamepad A
    const kJump = this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['KeyZ'] || this.keys['KeyK'] || gpJump || !!this.touchState.jump;
    const prevJump = this.keysPrev['jump'] || false;
    const jumpJustPressed = (kJump && !prevJump) || !!this.touchJustPressed.jump;
    const jumpJustReleased = (!kJump && prevJump);

    // Attack: Space (المسطرة), KeyX, KeyJ, ShiftLeft, ShiftRight, or gamepad X
    const kAttack = this.keys['Space'] || this.keys['KeyX'] || this.keys['KeyJ'] || this.keys['ShiftLeft'] || this.keys['ShiftRight'] || gpAttack || !!this.touchState.attack;
    const prevAttack = this.keysPrev['attack'] || false;
    const attackJustPressed = (kAttack && !prevAttack) || !!this.touchJustPressed.attack;

    // Run: holding attack or Shift
    const kRun = kAttack || gpRun || !!this.touchState.run;

    // Pause: Escape, KeyP, or gamepad Start
    const kPause = this.keys['Escape'] || this.keys['KeyP'] || gpPause || !!this.touchState.pauseJustPressed;
    const prevPause = this.keysPrev['pause'] || false;
    const pauseJustPressed = (kPause && !prevPause) || !!this.touchJustPressed.pauseJustPressed;

    this.state = {
      left: kLeft,
      right: kRight,
      up: kUp,
      down: kDown,
      jump: kJump,
      jumpJustPressed,
      jumpJustReleased,
      attack: kAttack,
      attackJustPressed,
      run: kRun,
      pauseJustPressed,
    };

    // Store previous states
    this.keysPrev['jump'] = kJump;
    this.keysPrev['attack'] = kAttack;
    this.keysPrev['pause'] = kPause;

    // Clear one-shot touch flags
    this.touchJustPressed = {};
  }
}

export const inputManager = new InputManager();
