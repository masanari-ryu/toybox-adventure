import {it,expect} from 'vitest';
import {nightmareCaption,nightmareEndingDuration} from '../src/effects/EndingTimeline';
import {visibleTextValid} from '../src/ui/Text';
it('presents the nightmare story in order using player-safe text',()=>{expect(nightmareCaption(14)).toContain('ゆめ');expect(nightmareCaption(20)).toContain('つよく');expect(nightmareCaption(29)).toBe('いってきます！');expect(nightmareCaption(36)).toContain('なにか');expect(nightmareCaption(44)).toContain('あそびに おいでよ');expect(nightmareCaption(51)).toBe('おわり');for(let t=0;t<nightmareEndingDuration;t++)expect(visibleTextValid(nightmareCaption(t))).toBe(true);});
