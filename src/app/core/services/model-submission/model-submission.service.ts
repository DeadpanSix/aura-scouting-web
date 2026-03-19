import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Constant } from "../../constant/Constant";

@Injectable({ providedIn: 'root' })
  export class ModelSubmissionService {
    private http = inject(HttpClient);

    postModel(formData: FormData) {
      return this.http.post( environment.apiUrl + Constant.API_METHODS.MODEL_SUBMISSION.POST_MODEL, formData);
    }
  }