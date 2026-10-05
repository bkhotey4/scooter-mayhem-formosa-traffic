using System;
using UnityEngine;

namespace ScooterMayhem.Vehicle
{
    /// <summary>
    /// BackfireExhaustSystem (改裝排氣管回火放炮震撼音浪系統)
    /// Triggers realistic popping and fire bursts from modified exhaust pipes:
    /// - White Iron Chamber pipe has high probability backfire upon throttle release.
    /// - Hard braking from high speed produces crackling backfire pops.
    /// - Spawns sparks and flame particle bursts from exhaust tip.
    /// </summary>
    public class BackfireExhaustSystem : MonoBehaviour
    {
        [Header("Exhaust Config")]
        [SerializeField] private bool isWhiteIronPipe = false;
        [SerializeField] private Transform exhaustTipTransform;
        [SerializeField] private ParticleSystem backfireFlameParticles;
        [SerializeField] private AudioSource backfireAudioSource;

        [Header("Tuning")]
        [SerializeField] private float cooldownTime = 1.4f;
        [SerializeField] private float speedThresholdMs = 2.5f;

        private float currentCooldown = 0f;
        private float previousThrottle = 0f;

        public event Action<string, int> OnBackfireTriggered;

        public void SetWhiteIronPipe(bool enabled)
        {
            isWhiteIronPipe = enabled;
        }

        public void UpdateBackfire(float dt, float currentSpeedMs, float throttleInput, bool isBraking)
        {
            currentCooldown = Mathf.Max(0f, currentCooldown - dt);

            bool isDecel = (previousThrottle > 0f && throttleInput <= 0f) || (isBraking && Mathf.Abs(currentSpeedMs) > 3.0f);

            if (currentCooldown <= 0f && isDecel && Mathf.Abs(currentSpeedMs) > speedThresholdMs)
            {
                if (isWhiteIronPipe)
                {
                    TriggerBackfire("【改裝白鐵管・回火放炮炸街！】", 450);
                }
                else if (isBraking && Mathf.Abs(currentSpeedMs) > 5.5f)
                {
                    TriggerBackfire("【極速煞車回火】放炮震撼音浪！", 350);
                }
            }

            previousThrottle = throttleInput;
        }

        private void TriggerBackfire(string comboName, int score)
        {
            currentCooldown = cooldownTime;

            if (backfireFlameParticles != null)
            {
                backfireFlameParticles.Play();
            }

            if (backfireAudioSource != null)
            {
                backfireAudioSource.pitch = UnityEngine.Random.Range(0.85f, 1.25f);
                backfireAudioSource.Play();
            }

            OnBackfireTriggered?.Invoke(comboName, score);
        }
    }
}
