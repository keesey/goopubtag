import { memo } from "react";
import type { UnitTargeting } from "../../types";
import type { GPTSlotProps } from "./GPTSlot.type";
import { useGPTSlot } from "./useGPTSlot";
/**
 * This is the Ad unit Element to be set in the DOM
 *
 * @param {GPTSlotProps} props
 * @returns {JSX.Element}
 */
const GPTSlot = memo(
	<A extends UnitTargeting = UnitTargeting>(
		props: GPTSlotProps<A>,
	): JSX.Element => {
		const { slotId, className } = props;
		const { style } = useGPTSlot(props);
		return <div id={slotId} style={style} className={className} />;
	},
);

export { GPTSlot };
