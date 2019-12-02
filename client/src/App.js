import React from 'react';
import Draggable from 'react-draggable';

class App extends React.Component {
  state = {
    img: []
  }

  fetchImages = () => {
    fetch('/api/files')
    .then(res => res.json())
    .then((data) => 
    this.setState({
      img: data
    }))
  }

  Post = e => {

    // e.preventDefault()
    const file = document.getElementById('inputGroupFile01').files
    const formData = new FormData()
  
    formData.append('img', file[0])
  
    fetch('/', {
      method: 'POST',
      body: formData,
    })
    fetch('/api/files')
    .then(res => res.json())
    .then((data) => 
    this.setState({
      img: data
    }))

  // document
  // .getElementById('img')
  // .setAttribute('src', `/${file[0].name}`)
  }
  componentDidMount() {
    this.fetchImages()
  }
  render(){


    return (
      <div >
      <div className="container">
      <h1 className="display-4">Welcome to The World</h1>
 
        <input
          type="file"
          className="button-input"
          id="inputGroupFile01"
          aria-describedby="inputGroupFileAddon01"
        />
        <label htmlFor="inputGroupFile01">
          Choose file
        </label>
    <button type="button" className="btn" onClick={this.Post}>
      Upload
    </button>
      
 
<div className="grid">
    {this.state.img.map((img, i) => {
      return <div className="grid-item">
      <Draggable key={i}>
        <img 
        className="grid-image"
        src={`/${img.filename}`}
        alt="posted"
          />
      </Draggable>
      </div>
    })}
</div>

  </div>
  </div >
  
  
    );
  }
}

export default App;
