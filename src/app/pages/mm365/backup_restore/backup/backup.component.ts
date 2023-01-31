import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MyUtils } from 'app/library/MyUtils';
import { MyFile } from 'app/library/MyFile';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { HttpPost } from 'app/library/HttpPost';
import { FunctionName } from 'app/constant/FunctionName';

@Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;
    isLoading: boolean = false;

    constructor(
        protected dateService: NbDateService<Date>,
        private dialogService: NbDialogService,
        public router: Router
    ) {

    }

    ngOnInit(): void {

    }




    // Button callback
    onBackupClicked() {

        this.isLoading = true;
        
        const httpPost = new HttpPost();
        httpPost.request(
            FunctionName.EXPORT_BACKUP_FILE,
            '',
            (xmlHttp: XMLHttpRequest) => {
                console.log("File ready");
                this.isLoading = false;
                let dateFormat: string = "yyyy_MM_dd";
                let currentDate = new Date();
                let filename = "money_manager_" + this.dateService.format(currentDate, dateFormat);;
                let url = this.globalData.serverUrl + FunctionName.EXPORT_BACKUP_FILE_URL;
                MyFile.downloadFileFromUrl(filename, url);
            },
            (xmlHttp: XMLHttpRequest) => {
                let error = xmlHttp.responseText;
                console.log(error);
                this.isLoading = false;
            },
            false
        );
    }
}

