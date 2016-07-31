const React = require('react');
const {
  Link,
  IndexLink,
} = require('react-router');
const {
  Navbar,
  Nav,
  NavItem,
} = require('react-bootstrap');

const NavLink = React.createClass({
  render(){
    const className = this.context.router.isActive(this.props.to)?'active':'';
    return <li className={className}><Link {...this.props}/></li>;
  }
});

NavLink.contextTypes = {
  router: React.PropTypes.object.isRequired
};

const RemoteLink = React.createClass({
  render(){
    return <li><a href={this.props.to} target="_blank">{this.props.children}</a></li>;
  }
});

const IndexNavLink = React.createClass({
  render(){
    return <IndexLink {...this.props} activeClassName="active"/>;
  }
});

module.exports = React.createClass({
  render(){
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <IndexNavLink to="/">Underwire</IndexNavLink>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavLink to="/graph">Graph</NavLink>
          <NavLink to="/nodes">Nodes</NavLink>
          <NavLink to="/edges">Edges</NavLink>
          <NavLink to="/about">About</NavLink>
          <RemoteLink to="https://github.com/underwire/underwire">Github</RemoteLink>
        </Nav>
      </Navbar>
    );
  }
});
