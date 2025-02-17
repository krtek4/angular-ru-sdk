import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Any, Immutable } from '@angular-ru/cdk/typings';
import { NgxsDataPluginModule } from '@angular-ru/ngxs';
import { StateRepository } from '@angular-ru/ngxs/decorators';
import { NgxsImmutableDataRepository } from '@angular-ru/ngxs/repositories';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { PlainObjectOf } from '@ngxs/store/internals';

describe('check correct deep instance', () => {
    let app: AppState;
    let store: Store;

    @State({
        name: 'childB_A_A',
        defaults: ['B_A_A_1', 'B_A_A_1']
    })
    @Injectable()
    class MyChildBaa {}

    @State({
        name: 'childB_A',
        defaults: { value: 'B_A_1' },
        children: [MyChildBaa]
    })
    @Injectable()
    class MyChildBa {
        @Action({ type: 'MyChildBa_ACTION' })
        public myMutate(ctx: StateContext<Any>): void {
            ctx.setState((state: Any) => ({ ...state, value: 'NEW_B_A_1' }));
        }
    }

    @State({
        name: 'childB',
        defaults: { value: 'B_A' },
        children: [MyChildBa]
    })
    @Injectable()
    class MyChildB {}

    @State({
        name: 'childA',
        defaults: { value: 'A_1' }
    })
    @Injectable()
    class MyChildA {}

    @StateRepository()
    @State({
        name: 'app',
        defaults: {},
        children: [MyChildA, MyChildB]
    })
    @Injectable()
    class AppState extends NgxsImmutableDataRepository<Any> {
        public initial: Immutable<PlainObjectOf<Any>> = {};

        public setup(): void {
            this.initial = JSON.parse(JSON.stringify(this.getState()));
        }

        public resetAll(): void {
            this.ctx.setState(this.initial);
        }
    }

    @Injectable()
    class Facade implements OnDestroy {
        constructor(private readonly appState: AppState) {}

        public save(): void {
            this.appState.setup();
        }

        public ngOnDestroy(): void {
            this.appState.resetAll();
        }
    }

    @Component({
        selector: 'app',
        template: '',
        providers: [Facade]
    })
    class AppComponent implements OnInit {
        constructor(private readonly facade: Facade) {}

        public ngOnInit(): void {
            this.facade.save();
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [
                NgxsModule.forRoot([AppState, MyChildB, MyChildBa, MyChildBaa, MyChildA]),
                NgxsDataPluginModule.forRoot()
            ]
        }).compileComponents();

        app = TestBed.inject<AppState>(AppState);
        store = TestBed.inject<Store>(Store);
    });

    it('should be correct app state tree', () => {
        expect(app.getState()).toEqual({
            childA: { value: 'A_1' },
            childB: {
                value: 'B_A',
                childB_A: { value: 'B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] }
            }
        });

        expect(store.snapshot()).toEqual({
            app: {
                childB: {
                    value: 'B_A',
                    childB_A: { value: 'B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] }
                },
                childA: { value: 'A_1' }
            }
        });
    });

    it('should be correct reset all', () => {
        const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);

        fixture.componentInstance.ngOnInit();

        expect(app.initial).toEqual({
            childB: {
                value: 'B_A',
                childB_A: { value: 'B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] }
            },
            childA: { value: 'A_1' }
        });

        app.patchState({ childA: { value: 'A_2', newValue: 5 } });

        expect(app.getState()).toEqual({
            childB: {
                value: 'B_A',
                childB_A: { value: 'B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] }
            },
            childA: { value: 'A_2', newValue: 5 }
        });

        app.reset();

        expect(app.getState()).toEqual({
            childA: { value: 'A_1' },
            childB: { value: 'B_A', childB_A: { value: 'B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] } }
        });

        fixture.destroy();

        expect(app.getState()).toEqual({
            childB: {
                value: 'B_A',
                childB_A: { value: 'B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] }
            },
            childA: { value: 'A_1' }
        });

        // eslint-disable-next-line rxjs/no-ignored-observable
        app.dispatch({ type: 'MyChildBa_ACTION' });

        expect(app.getState()).toEqual({
            childB: {
                value: 'B_A',
                childB_A: { value: 'NEW_B_A_1', childB_A_A: ['B_A_A_1', 'B_A_A_1'] }
            },
            childA: { value: 'A_1' }
        });
    });
});
