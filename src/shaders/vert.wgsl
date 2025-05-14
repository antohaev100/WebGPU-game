struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color: vec3<f32>,
    @location(2) normal: vec3<f32>,
    @location(3) instancePos: vec2<f32>,
    @location(4) instanceRot: vec4<f32>,
};

struct VertexOutput {
    @builtin(position) screenPos: vec4<f32>,
    @location(0) pos: vec3<f32>,
    @location(1) color: vec3<f32>,
    @location(2) normal: vec3<f32>,
};

struct Uniforms {
    vp: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;


@vertex
fn main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    let rot = mat2x2<f32>(input.instanceRot.xy, input.instanceRot.zw);
    output.color = input.color;
    let rotatedNormalXZ = rot * input.normal.xz;
    output.normal = vec3<f32>(rotatedNormalXZ.x, input.normal.y, rotatedNormalXZ.y);
    let rotatedPosXZ = input.instancePos + rot * input.position.xz;
    output.pos = vec3<f32>(rotatedPosXZ.x, input.position.y, rotatedPosXZ.y);
    output.screenPos = uniforms.vp * vec4<f32>(output.pos, 1.0);

    return output;
}