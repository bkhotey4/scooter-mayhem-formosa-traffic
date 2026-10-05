using System;
using UnityEngine;

namespace ScooterMayhem.Environment
{
    public enum TimeAtmosphereMode
    {
        DuskFengjia,        // 🌅 逢甲黃昏
        MidnightTonghua,    // 🌃 通化深夜 (Cyberpunk neon)
        ThunderstormStorm   // ⛈️ 狂暴雷雨 (Lightning & thunder)
    }

    public class TimeWeatherController : MonoBehaviour
    {
        [Header("References")]
        public Light sunDirectionalLight;
        public Light ambientLight;
        public AudioSource thunderAudioSource;

        [Header("Current Mode")]
        public TimeAtmosphereMode currentMode = TimeAtmosphereMode.DuskFengjia;

        [Header("Lightning Settings")]
        public float minLightningInterval = 5f;
        public float maxLightningInterval = 12f;

        private float lightningTimer = 0f;
        private bool isLightning = false;
        private float flashDuration = 0f;

        private void Start()
        {
            ApplyMode(currentMode);
        }

        private void Update()
        {
            if (currentMode == TimeAtmosphereMode.ThunderstormStorm)
            {
                lightningTimer += Time.deltaTime;
                if (!isLightning && lightningTimer > UnityEngine.Random.Range(minLightningInterval, maxLightningInterval))
                {
                    TriggerLightning();
                }

                if (isLightning)
                {
                    flashDuration -= Time.deltaTime;
                    if (flashDuration <= 0f)
                    {
                        isLightning = false;
                        ApplyMode(currentMode);
                    }
                }
            }
        }

        public void NextMode()
        {
            int next = ((int)currentMode + 1) % Enum.GetValues(typeof(TimeAtmosphereMode)).Length;
            ApplyMode((TimeAtmosphereMode)next);
        }

        public void ApplyMode(TimeAtmosphereMode mode)
        {
            currentMode = mode;
            switch (mode)
            {
                case TimeAtmosphereMode.DuskFengjia:
                    RenderSettings.fog = true;
                    RenderSettings.fogColor = new Color(0.06f, 0.08f, 0.12f);
                    RenderSettings.fogDensity = 0.008f;
                    if (sunDirectionalLight)
                    {
                        sunDirectionalLight.color = new Color(1.0f, 0.93f, 0.86f);
                        sunDirectionalLight.intensity = 1.2f;
                    }
                    break;

                case TimeAtmosphereMode.MidnightTonghua:
                    RenderSettings.fog = true;
                    RenderSettings.fogColor = new Color(0.02f, 0.03f, 0.05f);
                    RenderSettings.fogDensity = 0.012f;
                    if (sunDirectionalLight)
                    {
                        sunDirectionalLight.color = new Color(0.27f, 0.4f, 0.67f);
                        sunDirectionalLight.intensity = 0.45f;
                    }
                    break;

                case TimeAtmosphereMode.ThunderstormStorm:
                    RenderSettings.fog = true;
                    RenderSettings.fogColor = new Color(0.04f, 0.06f, 0.1f);
                    RenderSettings.fogDensity = 0.016f;
                    if (sunDirectionalLight)
                    {
                        sunDirectionalLight.color = new Color(0.4f, 0.47f, 0.6f);
                        sunDirectionalLight.intensity = 0.5f;
                    }
                    break;
            }
        }

        private void TriggerLightning()
        {
            lightningTimer = 0f;
            isLightning = true;
            flashDuration = 0.12f;

            if (sunDirectionalLight)
            {
                sunDirectionalLight.color = Color.white;
                sunDirectionalLight.intensity = 4.5f;
            }

            if (thunderAudioSource != null)
            {
                thunderAudioSource.Play();
            }
        }
    }
}
