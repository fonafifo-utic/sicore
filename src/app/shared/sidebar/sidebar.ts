import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from '../../home/inicio.temp.service2';
import { CommonModule } from '@angular/common';
import { PrimeNgModule } from '../prime-ng.module';
import { MenuComponente } from "../menu/menu";

@Component({
    selector: 'sidebar',
    templateUrl: 'sidebar.html',
    styleUrl : 'sidebar.css',
    standalone : true,
    imports: [CommonModule, PrimeNgModule, MenuComponente]
})
export class SideBar {

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    constructor(public layoutService: LayoutService, public el: ElementRef) { }
}