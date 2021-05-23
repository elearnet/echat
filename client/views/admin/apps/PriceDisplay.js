import { Box } from '@rocket.chat/fuselage';
import React, { useMemo } from 'react';

import { useTranslation } from '../../../contexts/TranslationContext';
import { formatPricingPlan, formatPrice } from './helpers';

const formatPriceAndPurchaseType = (purchaseType, pricingPlans, price) => {
	if (purchaseType === 'subscription') {
		const type = 'Subscription';
		if (!pricingPlans || !Array.isArray(pricingPlans) || pricingPlans.length === 0) {
			return { type, price: '-' };
		}

		const pricingPlan = pricingPlans[0];
		const tiers = Array.isArray(pricingPlan.tiers) ? pricingPlan.tiers : undefined;
		if (pricingPlan.price === 0 && !!tiers) {
			pricingPlan.price = tiers[0].price;
		}
		return { type, price: formatPricingPlan(pricingPlan), tiers };
	}

	if (price > 0) {
		return { type: 'Paid', price: formatPrice(price) };
	}

	return { type: 'Free', price: '-' };
};

function PriceDisplay({ purchaseType, pricingPlans, price, showType = true, ...props }) {
	const t = useTranslation();

	const { type, price: formatedPrice } = useMemo(
		() => formatPriceAndPurchaseType(purchaseType, pricingPlans, price),
		[purchaseType, pricingPlans, price],
	);
	return (
		<Box display='flex' flexDirection='column' {...props}>
			{showType && (
				<Box color='default' withTruncatedText>
					{t(type)}
				</Box>
			)}
			<Box color='hint' withTruncatedText>
				{!showType && type === 'Free' ? t(type) : formatedPrice}
			</Box>
		</Box>
	);
}

export default PriceDisplay;
