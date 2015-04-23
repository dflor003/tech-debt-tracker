/// <reference path="../libs.d.ts" />

module tetra.techdebt {
    export interface ITechDebtDetailData{
        id: string;
        name: string;
        description: string;
        impediments: any[]
    }

    export class TechDebtDetail {
        private id: string;
        private name: string;
        private description: string;
        private impediments: any[] = [];

        constructor(data: ITechDebtDetailData) {
            this.id = data.id;
            this.name = data.name;
            this.description = data.description;
        }
    }
}