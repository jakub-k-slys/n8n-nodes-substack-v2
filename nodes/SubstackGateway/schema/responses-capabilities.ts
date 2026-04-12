import * as Schema from 'effect/Schema';

export const GatewayCapabilitiesSchema = Schema.Struct({
	application: Schema.String,
	tier: Schema.String,
	version: Schema.String,
	features: Schema.Array(Schema.String),
});
export type GatewayCapabilities = Schema.Schema.Type<typeof GatewayCapabilitiesSchema>;
