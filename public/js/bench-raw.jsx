// This implementation runs at roughly 200 fps
import { render, Component } from 'inferno';
import { fps, mem, store } from './perf-helper';

function Stats() {
  const fpsStat = fps();
  const memStat = mem();

  return (
    <table class="bench-stats">
      <tr>
        <th>Stat</th>
        <th>Avg</th>
        <th>Max</th>
      </tr>
      <tr>
        <td>FPS</td>
        <td>{fpsStat.avg}</td>
        <td>{fpsStat.max}</td>
      </tr>
      <tr>
        <td>Mem</td>
        <td>{memStat.avg}MB</td>
        <td>{memStat.max}MB</td>
      </tr>
    </table>
  );
}

function Color({ val, children }) {
  const colors = [
    'GreenYellow',
    'SpringGreen',
    'MediumSpringGreen',
    'LightGreen',
    'PaleGreen',
    'DarkSeaGreen',
    'MediumAquamarine',
    'MediumSeaGreen',
    'SeaGreen',
    'ForestGreen',
    'Green',
    'DarkGreen',
  ];

  return <span style={{ color: colors[val % colors.length] }}>{children}</span>;
}

function NestedCell({ val }) {
  return <span>{val}</span>;
}

function Cell({ val, i }) {
  return i % 10 === 0 ? (
    <div>
      <NestedCell val={val} />
    </div>
  ) : (
    <Color val={val}>
      <NestedCell val={val} />
    </Color>
  );
}

function Row({ arr }) {
  return (
    <>
      {arr.map((val, i) => (
        <Cell val={val} i={i} key={i} />
      ))}
    </>
  );
}

function LiveStats() {
  return <Stats />;
}

function fill(size) {
  const rows = new Array(size);
  rows.fill(0);
  return rows;
}

function Arr({ state }) {
  const size = 50;
  const { arr } = state;

  return (
    <>
      {fill(arr.length / size).map((_v, i) => (
        <Row key={i} arr={arr.slice(i * size, i * size + size)} />
      ))}
    </>
  );
}

class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.store = store;
    this.state = store.getState();
    this.unsubscribe = store.subscribe(() => {
      this.setState(store.getState());
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    this.unsubscribe();
  }

  componentDidMount() {
    const me = this;
    this.timeout = setTimeout(function tick() {
      me.store.dispatch('incSome');
      me.timeout = setTimeout(tick, 1);
    }, 1);
  }

  render() {
    return (
      <main>
        <h1>Xferno perf (raw)</h1>
        <Arr state={this.state} dispatch={this.store.dispatch} />
        <Stats state={this.state} />
      </main>
    );
  }
}

render(<Main />, document.body);
