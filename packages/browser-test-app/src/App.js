import React from "react";
import * as sidetreeCasIpfs from "@transmute/sidetree-cas-ipfs";
import { ipfs, methods, testObj } from "./fixtures";
const cas = sidetreeCasIpfs.configure({ ipfs, methods });

function App() {
  const [state, setState] = React.useState({});

  return (
    <div className="App">
      <button
        onClick={async () => {
          let cid = "QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen";
          let readObj = await cas.read(cid);
          let writtenCid = await cas.write(testObj);
          setState({
            cid,
            readObj,
            writtenCid,
          });
        }}
      >
        test
      </button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

export default App;
