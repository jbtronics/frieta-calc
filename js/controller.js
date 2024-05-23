import { Application, Controller } from "./stimulus.js"
import "./sweetalert2.all.min.js";
window.Swal = Sweetalert2;
window.Stimulus = Application.start()

const TIMEOUT = 30000; //30 seconds

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
        this.resultTarget.value = this.sum / 100 + " €";
    }

    reset() {
        this.sum = 0;
        this.updateResult();

        //Hide all badges and reset their value
        this.buttonTargets.forEach(btn => {
            let badge = btn.querySelector(".badge");
            if (badge) {
                badge.style.display = "none";
                badge.textContent = "0";
            }
        });
    }

    _resetTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.reset();
            this.timeout = null;
        }, TIMEOUT);
    }

    _btnClick(event) {
        //If no value is set, do nothing
        if (!event.target.dataset.value) {
            return;
        }

        this.sum += parseInt(event.target.dataset.value);
        this.updateResult();

        //Find the badge inside the button and update its value
        let badge = event.target.querySelector(".badge");
        if (badge) {
            badge.textContent = parseInt(badge.textContent) + 1;

            //And ensure it is visible
            badge.style.display = "block";
        }

        //Clear the existing timeout and set a new one
        this._resetTimeout();
    }

    async calculateChange() {
        if (this.sum === 0) {
            Swal.fire({
                icon: "error",
                title: "Keine Bestellung aufgegeben"
            });
            return;
        }

        if (this.sum < 0) {
            Swal.fire({
                icon: "error",
                title: "Betrag negativ. Geld an Kunden geben!"
            });
            return;
        }

        //Ask for the amount of money given
        //let given = prompt("Geld gegeben?");
        let result = await Swal.fire({
            title: "Geld von Kunde?",
            input: "number",
            inputAttributes: {
                min: this.sum / 100,
                step: "0.01"
            }
        });
        if (!result.isConfirmed) {
            return;
        }

        //Calculate the change
        let given = Number(result.value);

        this._resetTimeout();

        if (isNaN(given)) {
            Swal.fire({
                icon: "error",
                title: "Ungültige Eingabe"
            });
            return;
        }

        if (given < this.sum / 100) {
            Swal.fire({
                icon: "error",
                title: "Zu wenig Geld gegeben"
            });
            return;
        }

        let change = Number(given) - this.sum / 100;
        Swal.fire({
            icon: "success",
            title: "Rückgeld: " + change.toFixed(2) + " €"
        });
    }

    decrement(event) {
        //Find sibling button with the data-value attribute
        const decrementBtn = event.target.closest("button");

        const neighbor = decrementBtn.nextElementSibling;
        let value = neighbor.dataset.value;

        //If the value is not set, do nothing
        if (!value) {
            return;
        }

        //Find the badge inside the button and update its value
        let badge = neighbor.querySelector(".badge");
        if (badge) {

            let currentValue = parseInt(badge.textContent);

            //If the value is already 0, do nothing besides resetting the timeout
            if (currentValue === 0) {
                this._resetTimeout();
                return;
            }

            badge.textContent = currentValue - 1;

            //If the value is 0, hide the badge
            if (badge.textContent === "0") {
                badge.style.display = "none";
            }
        }

        //Decrement the sum
        this.sum -= parseInt(value);
        this.updateResult();

        //Clear the existing timeout and set a new one
        this._resetTimeout();
    }
})