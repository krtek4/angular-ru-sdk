import { TestBed } from '@angular/core/testing';
import { IncludesPipe, IncludesPipeModule } from '@angular-ru/cdk/pipes';

describe('deep path', () => {
    let pipe: IncludesPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [IncludesPipeModule] }).compileComponents();
        pipe = TestBed.inject(IncludesPipe);
    });

    it('decide if element is in array', () => {
        const array: string[] = ['first', 'second', 'third', 'last'];

        expect(pipe.transform(array, 'first')).toBe(true);
        expect(pipe.transform(array, 'second')).toBe(true);
        expect(pipe.transform(array, 'fifth')).toBe(false);
        expect(pipe.transform(array, undefined)).toBe(false);
        expect(pipe.transform(array, null)).toBe(false);
        expect(pipe.transform(null, null)).toBe(false);
        expect(pipe.transform(undefined, null)).toBe(false);
        expect(pipe.transform(null, 'first')).toBe(false);
        expect(pipe.transform(undefined, 'first')).toBe(false);
    });
});
