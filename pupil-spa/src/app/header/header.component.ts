import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [
      './header.component.scss'
  ]
})
export class HeaderComponent implements OnInit {

  govukRoot = 'https://www.gov.uk';
  govukAssetPath = 'assets/govuk_template';
  appTitle = 'Multiplication Tables Check';
  globalHeaderText = 'GOV.UK';

  constructor() {
  }

  ngOnInit() {
  }

}
