import { useState } from "react";

const [parameters, setParameters] = [
    {type: "live", label: "Live parameter 1"},
    {type: "live", label: "Live parameter 2"},
    {type: "live", label: "Live parameter 3"},
    {type: "live", label: "Live parameter 4"},
    {type: "live", label: "Live parameter 5"},
    {type: "live", label: "Live parameter 6"},
    { type: 'data', key: 'TV_g', value: 11 }, //The default parameters still need to be set for this
    { type: 'data', key: 'TC_TV_map', value: 68 },
    { type: 'data', key: 'Mu', value: 1.6 },
    { type: 'data', key: 'Bypass', value: 0 },
]