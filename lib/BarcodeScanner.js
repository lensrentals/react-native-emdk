import {NativeModules, DeviceEventEmitter} from 'react-native';
import { BarcodeScannerEvent }             from './BarcodeScannerEvent';

const Scanner = NativeModules.BarcodeScannerManager;

let instance = null;

export class BarcodeScanner {
    

    constructor() {
        
        if(!instance){
            instance = this;
            this.opened = false;
            this.start_reading = false;
            this.start_scanning = false;
            this.oncallbacks = {};
            this.config = {}

            DeviceEventEmitter.addListener('BarcodeEvent', this.handleBarcodeEvent.bind(this));
            DeviceEventEmitter.addListener('BarcodesEvent', this.handleBarcodesEvent.bind(this));
            DeviceEventEmitter.addListener('StatusEvent', this.handleStatusEvent.bind(this));
        }

    }

    handleStatusEvent(event) {
        if (event.StatusEvent == 'opened'){
            this.opened = true;
            if (this.start_reading){
                Scanner.read(this.config);
                this.start_reading = false;
            }else if (this.start_scanning){
                Scanner.scan();
                this.start_scanning = false;
            }
        }
    }

    handleBarcodeEvent(barcode) {
        if (this.oncallbacks[BarcodeScannerEvent.BARCODE]){
            this.oncallbacks[BarcodeScannerEvent.BARCODE].forEach((funct, index) => {
                funct(barcode);
            });
        }
    }

    handleBarcodesEvent(barcodes) {
        if (this.oncallbacks[BarcodeScannerEvent.BARCODES]){
            this.oncallbacks[BarcodeScannerEvent.BARCODES].forEach((funct, index) => {
                funct(barcodes);
            });
        }
    }

    init() {
        Scanner.init();
    }

    read(config = {}) {

        this.config = config;

        if (this.opened){
            Scanner.read(this.config);
        }else{
            this.start_reading = true;
        }
        
    }

    scan(config = {}) {

        this.config = config;
        
        if (this.opened){
            Scanner.scan(this.config);
        }else{
            this.start_scanning = true;
        }

    }    
    
    cancel() {
        Scanner.cancel();
    }

    enable() {
        Scanner.enable();
    }

    disable() {
        Scanner.disable();
    }

    on(event, callback) {
        if (!this.oncallbacks[event]){ this.oncallbacks[event] = []; }
        this.oncallbacks[event].push(callback);
    } 

    removeon(event, callback) {
        if (this.oncallbacks[event]){
            this.oncallbacks[event] = this.oncallbacks[event].filter(funct => funct !== callback);
        }
    }

    hason(event, callback) {
        if (this.oncallbacks[event]){
            return this.oncallbacks[event].any(funct => funct === callback)
        } else {
            return false;
        }
    }
}

export default new BarcodeScanner();