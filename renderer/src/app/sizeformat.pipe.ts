import { Injectable, Pipe } from '@angular/core';

@Pipe({name: 'size'})

@Injectable()
export class SizeFormat {

    public transform(value, args: string[]): any {

        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        if (value === 0) return '0 Byte';

        const i = parseInt(Math.floor(Math.log(value) / Math.log(1024)) + '');

        return Math.round(value / Math.pow(1024, i)) + ' ' + sizes[i];
    }
}
