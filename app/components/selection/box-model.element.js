import { BoxModelStyles } from '../styles.store'

export class BoxModel extends HTMLElement {

  constructor() {
    super()
    this.$shadow = this.attachShadow({mode: 'closed'})
    this.drawable = {}
  }

  connectedCallback() {
    this.$shadow.adoptedStyleSheets = [BoxModelStyles]
  }

  disconnectedCallback() {}

  set position(payload) {
    this.$shadow.innerHTML = this.render(payload)
    if (!this.drawable.measurements) // && payload.color === 'pink'
      this.createMeasurements(payload)
  }

  render({mode, bounds, sides, color = 'pink'}) {
    const total_height  = bounds.height + sides.bottom + sides.top
    const total_width   = bounds.width + sides.right + sides.left

    if (mode === 'padding') {
      this.drawable = {
        height:   bounds.height - (sides.borders.top + sides.borders.bottom),
        width:    bounds.width - (sides.borders.right + sides.borders.left),
        top:      0 + sides.borders.top,
        left:     0 + sides.borders.left,
        rotation: 'rotate(-45)',
      }
    }
    else if (mode === 'margin') {
      this.drawable = {
        height:   total_height,
        width:    total_width,
        top:      0 - sides.top,
        left:     0 - sides.left,
        rotation: 'rotate(45)',
      }
    }

    if (color === 'pink') {
      this.drawable.bg = 'color(display-p3 1 0 1 / 15%)'
      this.drawable.stripe = 'color(display-p3 1 0 1 / 80%)'
    }
    else {
      this.drawable.bg = 'color(display-p3 .75 0 1 / 15%)'
      this.drawable.stripe = 'color(display-p3 .75 0 1 / 80%)'
    }

    this.styles({sides})

    return `
      <div mask>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="pinstripe" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="${this.drawable.rotation}" class="pattern">
              <line x1="0" y="0" x2="0" y2="10" stroke="${this.drawable.stripe}" stroke-width="1"></line>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pinstripe)"></rect>
        </svg>
      </div>
    `
  }

  styles({sides}) {
    this.style.setProperty('--width', `${this.drawable.width}px`)
    this.style.setProperty('--height', `${this.drawable.height}px`)
    this.style.setProperty('--top', `${this.drawable.top}px`)
    this.style.setProperty('--left', `${this.drawable.left}px`)
    this.style.setProperty('--bg', `${this.drawable.bg}`)

    this.style.setProperty('--target-left', `${sides.left}px`)
    this.style.setProperty('--target-top', `${sides.top}px`)
    this.style.setProperty('--target-right', `${sides.right}px`)
    this.style.setProperty('--target-bottom', `${sides.bottom}px`)

    this.style.setProperty('--offset-right', `${this.drawable.width - sides.right}px`)
    this.style.setProperty('--offset-bottom', `${this.drawable.height - sides.bottom}px`)
  }

  createMeasurements({mode, bounds, sides, color}) {
    const win_width   = window.innerWidth
    const pill_height = 18
    const offset      = 3

    if (mode === 'margin') {
      if (sides.top) {
        this.createMeasurement({
          x: (bounds.width / 2) - offset,
          y: (window.scrollY * -1) - sides.top,
          d: sides.top,
          q: 'top',
          v: true,
          color,
        })
      }
      if (sides.bottom) {
        this.createMeasurement({
          x: (bounds.width / 2) - offset,
          y: (window.scrollY * -1) + bounds.height,
          d: sides.bottom,
          q: 'bottom',
          v: true,
          color,
        })
      }
      if (sides.right) {
        this.createMeasurement({
          x: bounds.width,
          y: (window.scrollY * -1) + (bounds.height / 2) - offset,
          d: sides.right,
          q: 'right',
          v: false,
          color,
        })
      }
      if (sides.left) {
        this.createMeasurement({
          x: sides.left * -1,
          y: (window.scrollY * -1) + (bounds.height / 2) - offset,
          d: sides.left,
          q: 'left',
          v: false,
          color,
        })
      }
    }
    else if (mode === 'padding') {
      if (sides.top) {
        this.createMeasurement({
          x: (bounds.width / 2) - offset,
          y: (window.scrollY * -1) + sides.borders.top,
          d: sides.top,
          q: 'top',
          v: true,
          color,
        })
      }
       if (sides.bottom) {
         this.createMeasurement({
           x: (bounds.width / 2) - offset,
           y: (window.scrollY * -1) + (bounds.height - sides.bottom - sides.borders.bottom),
           d: sides.bottom,
           q: 'bottom',
           v: true,
           color,
         })
       }
       if (sides.right) {
         this.createMeasurement({
           x: bounds.width - sides.right - sides.borders.right,
           y: (window.scrollY * -1) + (bounds.height / 2) - offset,
           d: sides.right,
           q: 'right',
           v: false,
           color,
         })
       }
       if (sides.left) {
         this.createMeasurement({
           x: 0 + sides.borders.left,
           y: (window.scrollY * -1) + (bounds.height / 2) - offset,
           d: sides.left,
           q: 'left',
           v: false,
           color,
         })
       }
    }
  }

  createMeasurement(line_model, node_label_id=0) {
    const measurement = document.createElement('visbug-distance')
    measurement.position = { line_model, node_label_id }
    this.$shadow.appendChild(measurement)
  }
}

customElements.define('visbug-boxmodel', BoxModel)
