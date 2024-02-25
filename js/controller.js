import { Application, Controller } from "./stimulus.js"
window.Stimulus = Application.start()

const TIMEOUT = 5000; //10 seconds

Stimulus.register("frieta", class extends Controller {
    static targets = [ "result", "button" ]

    /** The sum in cents */
    sum = 0;

    timeout = null;

    connect() {
        //Register the btnClick method as an event listener for all buttons
        this.buttonTargets.forEach(btn => btn.addEventListener("click", this._btnClick.bind(this)));
    }

    updateResult() {
        this.resultTarget.textContent = this.sum / 100 + " €";
    }

    reset() {
        this.sum = 0;
        this.updateResult();
    }

    _btnClick(event) {
        this.sum += parseInt(event.target.dataset.value);
        this.updateResult();

        //Clear the existing timeout and set a new one
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.reset();
            this.timeout = null;
        }, TIMEOUT);
    }
})