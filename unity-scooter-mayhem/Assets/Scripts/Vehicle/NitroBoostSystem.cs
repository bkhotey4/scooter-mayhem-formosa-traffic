// NitroBoostSystem.cs - Unity 6 Iced Water Nitro Boost & Camera Warp System
using UnityEngine;

namespace ScooterMayhem.Vehicle
{
    public class NitroBoostSystem : MonoBehaviour
    {
        [Header("Nitro Settings")]
        public float nitroDuration = 5.5f;
        public float nitroTopSpeedKmH = 120f;
        public float nitroAccelerationMultiplier = 2.2f;

        [Header("Visual & Camera FX")]
        public ParticleSystem[] nitroFlames;
        public Camera mainCamera;
        public float normalFov = 60f;
        public float nitroFov = 76f;
        public float fovLerpSpeed = 7f;

        [Header("Current State")]
        public bool isNitroActive = false;
        public float nitroTimeRemaining = 0f;

        private ScooterVehicleController vehicleController;

        private void Awake()
        {
            vehicleController = GetComponent<ScooterVehicleController>();
            if (mainCamera == null) mainCamera = Camera.main;
        }

        public void TriggerNitro(float duration = -1f)
        {
            isNitroActive = true;
            nitroTimeRemaining = duration > 0 ? duration : nitroDuration;

            if (nitroFlames != null)
            {
                foreach (var ps in nitroFlames)
                {
                    if (ps != null) ps.Play();
                }
            }

            Debug.Log("<color=cyan>【結冰水神力加持！】 氮氣爆衝全開！</color>");
        }

        private void Update()
        {
            if (isNitroActive)
            {
                nitroTimeRemaining -= Time.deltaTime;
                if (nitroTimeRemaining <= 0f)
                {
                    StopNitro();
                }
            }

            // Camera FOV Dynamic Interpolation
            if (mainCamera != null)
            {
                float targetFov = isNitroActive ? nitroFov : normalFov;
                mainCamera.fieldOfView = Mathf.Lerp(mainCamera.fieldOfView, targetFov, Time.deltaTime * fovLerpSpeed);
            }
        }

        private void StopNitro()
        {
            isNitroActive = false;
            nitroTimeRemaining = 0f;

            if (nitroFlames != null)
            {
                foreach (var ps in nitroFlames)
                {
                    if (ps != null) ps.Stop();
                }
            }
        }
    }
}
