import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faUnlockKeyhole } from '@fortawesome/free-solid-svg-icons';
import { LogService } from 'src/app/services/log.service';


@Component({
  selector: 'app-block-item',
  templateUrl: './block-item.component.html',
  styleUrls: ['./block-item.component.css']
})
export class BlockItemComponent implements OnInit{

  @Input() id!: number;
  
  name: string = '';
  img?: string = '';
  imageSrc!: string;
  showDetails: boolean = false;
  size: string = '45px';
  
  faUnblock = faUnlockKeyhole;

  @Output() unblock: EventEmitter<number> = new EventEmitter();

  constructor(private logService: LogService) {}

  onToggleAction() {
    this.showDetails = !this.showDetails;
    this.size = (this.showDetails) ? '90px' : '45px';
  }

  unblockUser() {
    this.unblock.emit(this.id);
  }

  ngOnInit(): void {
    console.log('block item id: ' + this.id);

    this.logService.getUserById(this.id).subscribe({
      next: (user) => {
        this.name = user.name;
        this.img = user.img;
        this.imageSrc = this.img;
      },
      error: (value) => {
        console.log('getUserById failed ' + value);
      }
    });
  }
}
