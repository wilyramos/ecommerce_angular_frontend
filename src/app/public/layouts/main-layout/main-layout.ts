import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-main-layout',
  imports: [ CommonModule, RouterOutlet, Header ],
  templateUrl: './main-layout.html',
})
export class MainLayout {

}
