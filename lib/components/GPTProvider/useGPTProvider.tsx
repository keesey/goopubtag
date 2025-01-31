import { useEffect, useState } from "react";

import type { Attributes, SlotLoadEvent, SlotProvider } from "../../types";
import { getGPTScript } from "../../utils";
import { dispatchEvent } from "../../utils/events";
import { gtag } from "../../utils/gtag";
import type { Unit } from "./GPTProvider.type";

type UseGPTProvider = {
	isLoaded: boolean;
	units: Unit[];
	addUnit: (unit: Unit) => void;
};

const useGPTProvider = <PageAttributes extends Attributes>(
	props: SlotProvider<PageAttributes>,
): UseGPTProvider => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [units, setUnits] = useState<Unit[]>([]);
	const {
		networkId,
		limitedAds = false,
		fallback = "default",
		targetingArguments,
		outOfPage,
		lazyLoad,
	} = props;

	const addUnit = (unit: Unit) => setUnits((prev) => [...prev, unit]);

	useEffect(() => {
		const gptScript = getGPTScript({ limitedAds });
		gptScript.addEventListener("load", () => setIsLoaded(true));
		document.getElementsByTagName("head")[0].appendChild(gptScript);
	}, [limitedAds]);

	useEffect(() => {
		if (isLoaded) {
			gtag.push(() => {
				if (outOfPage) {
					const { settings } = outOfPage;
					// TODO: figure out how to test anchor
					const adUnitPath = gtag.getAdUnitPath(networkId, settings.adUnit);
					const unit = gtag.createOutOfPageSlot(
						adUnitPath,
						gtag.getOutOfPageSlotId(outOfPage),
					);

					if (unit && settings.targetingArguments) {
						for (const targetingKey of Object.keys(
							settings.targetingArguments,
						)) {
							unit.setTargeting(
								targetingKey,
								settings.targetingArguments[targetingKey],
							);
						}

						gtag.addService(unit);

						gtag.handleRewarded(outOfPage);
					}
				}
				if (targetingArguments) {
					for (const targetingKey of Object.keys(targetingArguments)) {
						gtag.setTargeting(targetingKey, targetingArguments[targetingKey]);
					}
				}

				gtag.handleSlotLoad((detail) => {
					dispatchEvent("slot_load", detail);
				});

				gtag.handleSlotRequested((detail) => {
					dispatchEvent("slot_requested", detail);
				});

				gtag.handleSlotIsViewable((detail) => {
					dispatchEvent("impression_viewable", detail);
				});

				gtag.handleSlotRenderEnded((detail) => {
					dispatchEvent("slot_render_ended", detail);
				});

				gtag.handleFallback(fallback);
				// gtag.enableSingleRequest();
			});
		}
	}, [isLoaded, fallback, outOfPage, targetingArguments, networkId]);

	return {
		isLoaded,
		units,
		addUnit,
	};
};

export { useGPTProvider };
