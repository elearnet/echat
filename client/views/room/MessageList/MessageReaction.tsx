import {
	MessageReaction as MessageReactionTemplate,
	ReactionEmoji,
	ReactionCouter,
} from '@rocket.chat/fuselage';
import React, { FC, useRef } from 'react';

import { useTooltipClose, useTooltipOpen } from '../../../contexts/TooltipContext';
import { useTranslation, TranslationKey } from '../../../contexts/TranslationContext';
import { getEmojiClassNameAndDataTitle } from '../../../lib/utils/renderEmoji';

type TranslationRepliesKey =
	| 'You_have_reacted'
	| 'Users_and_more_reacted_with'
	| 'You_and_more_Reacted_with'
	| 'You_users_and_more_Reacted_with'
	| 'Users_reacted_with'
	| 'You_and_users_Reacted_with';

//   "You": "You",
//   "You_user_have_reacted": "You have reacted",
//   "Users_and_more_reacted_with": "__users__ and __count__ more have react with __emoji__",
//   "You_and_more_Reacted_with": "You, __users__ and __count__ more have react with __emoji__",
//   "You_and_Reacted_with": "You and __count__ more have react with __emoji__",

const getTranslationKey = (
	count: number,
	users: string[],
	mine: boolean,
): TranslationRepliesKey => {
	if (users.length === 1) {
		if (mine) {
			return 'You_have_reacted';
		}
	}

	if (users.length > 15) {
		if (mine) {
			return 'You_and_more_Reacted_with';
		}
		return 'Users_and_more_reacted_with';
	}

	if (mine) {
		return 'You_and_users_Reacted_with';
	}
	return 'Users_reacted_with';
};
export const MessageReaction: FC<{
	hasReacted: (name: string) => boolean;
	reactToMessage: (name: string) => void;
	counter: number;
	name: string;
	names: string[];
}> = ({ hasReacted, reactToMessage, counter, name, names }) => {
	const t = useTranslation();
	const ref = useRef<HTMLElement>(null);
	const openTooltip = useTooltipOpen();
	const closeTooltip = useTooltipClose();

	const mine = hasReacted(name);

	const key: TranslationKey = getTranslationKey(counter, names, mine) as TranslationKey;

	return (
		<MessageReactionTemplate
			ref={ref}
			key={name}
			mine={mine}
			onClick={(): void => reactToMessage(name)}
			tabindex='0'
			role='button'
			onMouseOver={() => {
				ref.current &&
					openTooltip(
						<>{t(key, { counter: names.length, users: names.join(', '), emoji: name })}</>,
						ref.current,
					);
			}}
			onMouseLeave={() => {
				closeTooltip();
			}}
		>
			<ReactionEmoji {...getEmojiClassNameAndDataTitle(name)} />
			<ReactionCouter counter={counter} />
		</MessageReactionTemplate>
	);
};
