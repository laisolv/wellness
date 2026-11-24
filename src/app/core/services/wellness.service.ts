import { Injectable } from "@angular/core";
import { WellnessActivity } from "../models/wellness-activity";
import { PublicationService } from "./publication";

@Injectable({
    providedIn: 'root'
})
export class WellnessService {
    constructor(private publicationService: PublicationService) {}


    getAll() {
        return this.publicationService.getWellnessActivities();
    }

    add(activity: WellnessActivity) {
        return this.publicationService.addWellnessActivity(activity);
    }

    update(activity: WellnessActivity) {
        return this.publicationService.updateWellnessActivity(activity);
    }

    delete(id: number) {
        return this.publicationService.deleteWellnessActivity(id);
    }
}