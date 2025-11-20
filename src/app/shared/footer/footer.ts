import {Component} from '@angular/core';
import { LayoutService } from '../../home/inicio.temp.service2';

@Component({
  selector: 'footer',
  templateUrl: 'footer.html'
})
export class AppFooterComponent {

    constructor(public layoutService: LayoutService) {}

    get colorScheme(): string {
        return this.layoutService.config().colorScheme;
    }
}
