struct FragmentInput {
    @location(0) pos: vec3<f32>,
    @location(1) color: vec3<f32>,
    @location(2) normal: vec3<f32>,
};

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
        // Define the light direction (normalized)
    let lightDirection: vec3<f32> = normalize(vec3<f32>(1.0, 3.0, 1.0));
    // Calculate the diffuse lighting factor
    let diffuse: f32 = max(dot(input.normal, lightDirection), 0.0);

        // Define ambient lighting factor
    let ambient: f32 = 0.5;

    // Calculate the final color with lighting
    let finalColor: vec3<f32> = input.color * (ambient + diffuse);
    // Calculate the final color with lighting
    return vec4<f32>(finalColor, 1.0);
    //DEBUG:
    //return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}