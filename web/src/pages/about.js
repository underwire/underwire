const React = require('react');
const pjson = require('../../../package.json');

module.exports = React.createClass({
  render(){
    return (
      <div className="container">
        <h1>Underwire v{pjson.version}</h1>
        <h2>What?</h2>
          <p>Underwire is a dependency graph viewer and manager system. It provides realtime updates to connected clients via Websockets and allows for systems to publish their connections dynamically.</p>
          <p>What this really means is that with Underwire and a little bit of code you can do some cool things like pull outbound connections from your application or service logs and visualize what your complete SOA looks like.</p>
          <p>You could also parse your code into an AST, normalize the AST and push it to Underwire to visualize the code flow and reuse patterns.</p>
          <p>Really the possibilities are endless.</p>
        <h2>Why?</h2>
          <p>Many years ago in a land far far away there was a piece of spaghetti that a company called a SOA. No one knew what called what, no one knew who did what, and no one could prove just how bad overall the setup was.</p>
          <p>An idea came about to take the configuration files from each service and review them for what called what.</p>
          <p>This proved time consuming and tedious.</p>
          <p>A crazy developer sat in a corner and thought that manual parsing was the worst way to do this. So he built a simple concept that parsed the files looking for things that resembled connection strings between services. Then built a simple UI on top of this and thus a system was born.</p>
          <p>The company created a team to build and manage this concept into a product. Life was good. Then things changed, the team was disbanded, and the product died. No matter how much everyone begged it was kept internal and closed source.</p>
          <p>Fast forward many many years later. Another need is noticed for a system that provides simple insights into the dependencies of systems. This time the crazy developer decides to build the system on his own time, and thus Underwire is born.</p>
      </div>
    );
  }
});
