import React from 'react';
import Menu from '../Menu.jsx';
import Footer from '../Footer.jsx';
import MatchList from './MatchList.jsx';
import { Container } from 'reactstrap';
export default class Matches extends React.Component {
  render () {
    return (
      <div>
        <Menu />
        <Container>
          <MatchList />
        </Container>
        <Footer />
      </div>);
  }
}
