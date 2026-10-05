using System;
using UnityEngine;

namespace ScooterMayhem.Cargo
{
    /// <summary>
    /// Simulates liquid sloshing physics, seal film durability tension,
    /// and bubble tea tapioca spill dynamics on the scooter rear box.
    /// </summary>
    public class BobaLiquidCargoSystem : MonoBehaviour
    {
        [Header("Cargo Capacity")]
        [SerializeField] private float maxLiquidVolume = 100f; // 100%
        [SerializeField] private float currentLiquidVolume = 100f;
        [SerializeField] private float sealMaxHp = 100f;
        [SerializeField] private float currentSealHp = 100f;

        [Header("Slosh Physics Tuning")]
        [SerializeField] private float springConstant = 22f;
        [SerializeField] private float damping = 4.5f;
        [SerializeField] private float maxTiltRad = 1.2f;

        [Header("Visual & Particle References")]
        [SerializeField] private ParticleSystem teaSpillParticles;
        [SerializeField] private Transform liquidSurfaceTransform;
        [SerializeField] private Material liquidShaderMaterial;

        // Runtime slosh oscillation
        private float liquidAngleRad;
        private float liquidAngularVelocity;
        private bool isSealBroken;

        public float RemainingLiquidPct => Mathf.Clamp01(currentLiquidVolume / maxLiquidVolume) * 100f;
        public float SealDurabilityPct => Mathf.Clamp01(currentSealHp / sealMaxHp) * 100f;
        public bool IsSealBroken => isSealBroken;

        public event Action OnSealBroken;
        public event Action<float> OnLiquidSpilled;

        public void UpdateSlosh(float dt, float speedMs, float rollAngleRad, float yawRate, float bumpJolt)
        {
            // 1. Calculate lateral & centrifugal force
            float centrifugalForce = (speedMs / 10f) * yawRate * 1.8f;
            float gravityRollComponent = Mathf.Sin(rollAngleRad) * 9.81f;
            float targetTilt = -(centrifugalForce - gravityRollComponent * 0.35f);

            // 2. Spring-Damper simulation
            float accel = -springConstant * (liquidAngleRad - targetTilt) - damping * liquidAngularVelocity;
            liquidAngularVelocity += accel * dt;
            liquidAngleRad += liquidAngularVelocity * dt;
            liquidAngleRad = Mathf.Clamp(liquidAngleRad, -maxTiltRad, maxTiltRad);

            // 3. Seal Stress & Film Durability Calculation
            float sloshStress = Mathf.Abs(liquidAngleRad) * 40f;
            float bumpStress = bumpJolt * 150f;
            float totalStress = sloshStress + bumpStress;

            if (totalStress > 25f)
            {
                float damage = (totalStress - 25f) * dt * 1.2f;
                currentSealHp = Mathf.Max(0f, currentSealHp - damage);

                if (currentSealHp <= 0f && !isSealBroken)
                {
                    isSealBroken = true;
                    OnSealBroken?.Invoke();
                }
            }

            // 4. Spill Calculation
            float spillThreshold = isSealBroken ? 0.35f : 0.95f;
            float overflow = Mathf.Abs(liquidAngleRad) - spillThreshold;

            if (overflow > 0f && currentLiquidVolume > 0f)
            {
                float spillRate = overflow * (isSealBroken ? 30f : 12f) * dt;
                currentLiquidVolume = Mathf.Max(0f, currentLiquidVolume - spillRate);

                OnLiquidSpilled?.Invoke(spillRate);

                if (teaSpillParticles != null && !teaSpillParticles.isPlaying)
                {
                    teaSpillParticles.Play();
                }
            }
            else
            {
                if (teaSpillParticles != null && teaSpillParticles.isPlaying)
                {
                    teaSpillParticles.Stop();
                }
            }

            // 5. Update Surface Mesh / Shader Tilt
            if (liquidSurfaceTransform != null)
            {
                liquidSurfaceTransform.localRotation = Quaternion.Euler(0f, 0f, liquidAngleRad * Mathf.Rad2Deg);
            }
        }

        public DeliveryResult EvaluateDelivery()
        {
            int stars = 5;
            string rank = "SSS";
            string comment = "完美封膜！黑糖虎紋清晰，珍珠香Q彈牙！";

            if (RemainingLiquidPct < 90f || isSealBroken)
            {
                stars = 4;
                rank = "A";
                comment = "稍微有滲漏，但味道還是很棒！下次轉彎慢一點。";
            }
            if (RemainingLiquidPct < 70f)
            {
                stars = 3;
                rank = "B";
                comment = "塑膠袋裡都是奶茶... 珍珠剩半杯，給我好好騎車好嗎！";
            }
            if (RemainingLiquidPct < 40f)
            {
                stars = 2;
                rank = "C";
                comment = "整杯灑到剩冰塊！你是把機車當越野摩托車在跳喔？！";
            }
            if (RemainingLiquidPct < 15f)
            {
                stars = 1;
                rank = "F";
                comment = "幹！根本就空杯！直接給負評檢舉，不用幹了啦！";
            }

            return new DeliveryResult
            {
                Stars = stars,
                Rank = rank,
                LiquidRemainingPct = RemainingLiquidPct,
                SealHpPct = SealDurabilityPct,
                CustomerComment = comment
            };
        }
    }

    [Serializable]
    public struct DeliveryResult
    {
        public int Stars;
        public string Rank;
        public float LiquidRemainingPct;
        public float SealHpPct;
        public string CustomerComment;
    }
}
