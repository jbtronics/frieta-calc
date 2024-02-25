import { Application, Controller } from "./stimulus.js"
window.Stimulus = Application.start()

Stimulus.register("frieta", class extends Controller {
    static targets = [ "result", "button" ]

    /** The sum in cents */
    sum = 0;

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
    }
})