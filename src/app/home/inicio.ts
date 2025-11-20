import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Renderer2, ViewChild, ViewEncapsulation, type OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LayoutService, TabCloseEvent } from './pages/dashboard/idashboard_temp_nd';
import { MenuService } from './inicio.temp.service';

import { SideBar } from '../shared/sidebar/sidebar';
import { Breadcrumb } from "../shared/breadcrumb/breadcrumb";
import { Header } from "../shared/header/header";

@Component({
    selector: 'inicio',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    templateUrl: 'inicio.html',
    styleUrl: 'inicio.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterOutlet,
        SideBar,
        Breadcrumb,
        Header
    ]
})
export default class InicioComponent implements OnInit {

  ngOnInit(): void { }

  overlayMenuOpenSubscription: Subscription;

    tabOpenSubscription: Subscription;

    tabCloseSubscription: Subscription;

    menuOutsideClickListener: any;

    menuScrollListener: any;

    @ViewChild(SideBar) sidebar!: SideBar;

    @ViewChild(Header) header!: Header;

    constructor(private menuService: MenuService, public layoutService: LayoutService, public renderer: Renderer2, public router: Router) {
        
      this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.sidebar.el.nativeElement.isSameNode(event.target) || this.sidebar.el.nativeElement.contains(event.target)
                    || this.header.menuButton.nativeElement.isSameNode(event.target) || this.header.menuButton.nativeElement.contains(event.target));
                    if (isOutsideClicked) {
                        this.hideMenu();
                    }
                });
            }

            if ((this.layoutService.isSlim() || this.layoutService.isSlimPlus()) && !this.menuScrollListener) {
                this.menuScrollListener = this.renderer.listen(this.sidebar.menuContainer.nativeElement, 'scroll', event => {
                    if (this.layoutService.isDesktop()) {
                        this.hideMenu();
                    }
                });
            }

            if (this.layoutService.state.staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.hideMenu();
            });

        this.tabOpenSubscription = this.layoutService.tabOpen$.subscribe(tab => {
            this.router.navigate(tab.routerLink);
            this.layoutService.openTab(tab);
        });

        this.tabCloseSubscription = this.layoutService.tabClose$.subscribe((event: TabCloseEvent) => {
            if (this.router.isActive(event.tab.routerLink[0], { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored'})) {
                const tabs = this.layoutService.tabs;

                if (tabs.length > 1) { 
                    if (event.index === (tabs.length - 1))
                        this.router.navigate(tabs[tabs.length - 2].routerLink);
                    else
                        this.router.navigate(tabs[event.index + 1].routerLink);
                }
                else {
                    this.router.navigate(['/']);
                }
            }

            this.layoutService.closeTab(event.index);
        });
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        }
        else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        }
        else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    hideMenu() {
        this.layoutService.state.overlayMenuActive = false;
        this.layoutService.state.staticMenuMobileActive = false;
        this.layoutService.state.menuHoverActive = false;
        this.menuService.reset();
        if(this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        
        if (this.menuScrollListener) {
            this.menuScrollListener();
            this.menuScrollListener = null;
        }

        this.unblockBodyScroll();
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }

        if (this.tabOpenSubscription) {
            this.tabOpenSubscription.unsubscribe();
        }

        if (this.tabCloseSubscription) {
            this.tabCloseSubscription.unsubscribe();
        }
    }

}