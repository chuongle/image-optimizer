import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import schema from './schema';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import './App.css';

const canvasWidth = 2200;
const zip = new JSZip();
const img = zip.folder('images');

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      worker: Worker,
      loader: false
    }
  }

  onSubmit({formData}) {
    this.setState({loader:true})
    const { images } = formData;
    images.forEach((image, index) => {
      const fileName = image.substring(image.indexOf('=')+1, image.lastIndexOf(';'));
      const type = (image.indexOf('jpeg')) ? 'image/jpeg' : 'image/png';
      const i = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      i.src = image;
      i.onload = function(){
        const imageWidth = i.width;
        const imageHeight = i.height;
        if (imageWidth > canvasWidth) {
          const ratio = imageWidth/imageHeight;
          const canvasHeight = canvasWidth/ratio;
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          ctx.drawImage(i, 0, 0, canvasWidth, canvasHeight);
        } else {
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(i, 0, 0, imageWidth, imageHeight);
        }
        const newImageData = canvas.toDataURL(type, 0.9);
        img.file(fileName, newImageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), {base64: true});
      };
    })

    setTimeout(function() {
      zip.generateAsync({type:'blob'})
      .then((content) => {
        FileSaver.saveAs(content, 'images.zip');
      });
    },1000)
  }

  render() {
    return (
      <div className="wrapper">
        <Form schema={schema}
          onSubmit={this.onSubmit.bind(this)} />
        {this.state.loader ? <div className="loader"></div> : null}
      </div>
    );
  }
}

export default App;