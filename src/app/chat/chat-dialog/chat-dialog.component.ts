import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatService, Message } from '../chat.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';


@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent implements OnInit, AfterViewChecked {

  conversation = [];
  new_input;
  values = '';

  messages: Observable<Message[]>;
  formValue: string;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  constructor(public chat: ChatService) { }

  ngOnInit() {
    // appends to array after each new message is added to feedSource
    this.messages = this.chat.conversation.asObservable()
      .scan((acc, val) => acc.concat(val));
    this.scrollToBottom();
  }

  sendMessage() {
    this.chat.converse(this.formValue);
    this.formValue = '';
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }



  getImage(response) {
    let image_url = response.find(item => item.response_type === 'image');

    if (image_url) {
      var image = '<img src="' + image_url.source + '">';
      console.log(image_url.source);
    
      let obj = {
        sender: 'bot',
        message: image,
        type: 'image'

      }
      
      return obj;
    }
    else {
      return null;
    }
  }

  getText (response) {
    var text = response.find(item => item.response_type === 'text');

    var one_response = "";

    var array_of_text =  response.filter(function(item) {
    return item.response_type === 'text';
  });

    if (array_of_text) {
      console.log(array_of_text);
      array_of_text.forEach((txt)=>{
        one_response+= txt.text;
      });
      var bot_text = {
        sender : "bot",
        message : one_response,
        type : 'text'
      }

      return bot_text;
    }
    else
    {
      return null;
    }
  }

  getOptions (response) {
      var options = response.find(item => item.response_type === 'option');
      var html_options = [];

      if (options) {
        var arr_op = options.options;
         arr_op.forEach((option)=>{
          var z = {
            label : option.label,
            value : option.value.input.text
          }
          console.log(option.value.input.text);
          html_options.push(z);
        }); 

        var buttons = {
          sender : "bot",
          message : html_options,
          type : 'option'
        }

        return buttons;
      }
      else {
        return null;
      }
  }

  select_option(option) {
    this.new_input = option;
    this.send_input();

  }

  send_input() {
    var obj = {
      message : this.new_input,
      sender : 'user'
    }

    this.conversation.push(obj);
    this.new_input = "";

    this.chat.send_user_input(obj).subscribe(
  (x)=>{
    var result : any;
    result = x;
    let newImage: any;
    console.log(x);
    console.log(result.output);
    console.log(result.output.generic);
     newImage = this.getImage(result.output.generic);
    if (newImage){
      this.conversation.push(newImage);
    }
     var b = this.getText(result.output.generic);
    if (b) {
       this.conversation.push(b);
    }
    var a = this.getOptions(result.output.generic); 
     if (a) {
       this.conversation.push(a);
    }
    
  },
  (e)=>{
    console.log(e);
  });
  }

}
