import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor(private router: Router, private ar: ActivatedRoute) { }

  ngOnInit() {
  }

  submit(): void {
    this.router.navigate(['overview']);
  }
}
