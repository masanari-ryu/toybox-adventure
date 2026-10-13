export const openSwitch={text:'あいた · しめる',color:0x78e5bb};
export const closedSwitch={text:'しまった · あける',color:0xf091ad};
export function switchStatus(open:boolean){return open?openSwitch:closedSwitch;}
